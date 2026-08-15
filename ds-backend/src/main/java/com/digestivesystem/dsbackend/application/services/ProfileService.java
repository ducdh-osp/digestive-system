package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.dtos.request.ChangePasswordRequest;
import com.digestivesystem.dsbackend.application.dtos.request.UpdateMedicalProfileRequest;
import com.digestivesystem.dsbackend.application.dtos.request.UpdateProfileRequest;
import com.digestivesystem.dsbackend.application.dtos.response.MedicalProfileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ProfileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ProfileUpdateResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.domain.entities.Customer;
import com.digestivesystem.dsbackend.domain.entities.MedicalProfile;
import com.digestivesystem.dsbackend.domain.repositories.CustomerRepository;
import com.digestivesystem.dsbackend.domain.repositories.MedicalProfileRepository;
import com.digestivesystem.dsbackend.infrastructure.file.LocalFileStorageService;
import com.digestivesystem.dsbackend.infrastructure.services.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class ProfileService {

    private final CustomerRepository customerRepository;
    private final MedicalProfileRepository medicalProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final LocalFileStorageService fileStorageService;

    public ProfileService(CustomerRepository customerRepository, MedicalProfileRepository medicalProfileRepository,
                          PasswordEncoder passwordEncoder, JwtService jwtService, UserDetailsServiceImpl userDetailsService,
                          LocalFileStorageService fileStorageService) {
        this.customerRepository = customerRepository;
        this.medicalProfileRepository = medicalProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.fileStorageService = fileStorageService;
    }

    private Customer getCurrentCustomer(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }

        String username = authentication.getName();
        if (username == null || !username.startsWith(SecurityConstants.CUSTOMER_PREFIX)) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập");
        }

        Customer customer = customerRepository.findByPhoneNumber(username.substring(SecurityConstants.CUSTOMER_PREFIX.length()))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản"));

        if (!Boolean.TRUE.equals(customer.getIsActive())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa");
        }

        return customer;
    }

    @Transactional(transactionManager = "postgresTransactionManager", readOnly = true)
    public ProfileResponse getProfile(Authentication authentication) {
        return buildProfileResponse(getCurrentCustomer(authentication));
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public ProfileUpdateResponse updateProfile(UpdateProfileRequest request, Authentication authentication) {
        Customer customer = getCurrentCustomer(authentication);

        String newPhoneNumber = request.getPhoneNumber().trim();
        String newEmail = normalizeEmail(request.getEmail());

        Optional<Customer> customerWithPhone = customerRepository.findByPhoneNumber(newPhoneNumber);
        if (customerWithPhone.isPresent() && !customerWithPhone.get().getId().equals(customer.getId())) {
            throw new BusinessException(HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng");
        }

        if (newEmail != null) {
            Optional<Customer> customerWithEmail = customerRepository.findByEmailIgnoreCase(newEmail);
            if (customerWithEmail.isPresent() && !customerWithEmail.get().getId().equals(customer.getId())) {
                throw new BusinessException(HttpStatus.CONFLICT, "Email đã được sử dụng");
            }
        }

        customer.setFullName(request.getFullName().trim());
        customer.setPhoneNumber(newPhoneNumber);
        customer.setEmail(newEmail);
        customer = customerRepository.save(customer);

        // Token cũ mang theo SĐT cũ (CUSTOMER:<phone>) nên phải cấp lại token mới sau khi đổi SĐT
        UserDetails userDetails = userDetailsService.loadUserByUsername(SecurityConstants.CUSTOMER_PREFIX + customer.getPhoneNumber());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new ProfileUpdateResponse(buildProfileResponse(customer), accessToken, refreshToken);
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public void changePassword(ChangePasswordRequest request, Authentication authentication) {
        Customer customer = getCurrentCustomer(authentication);

        if (!passwordEncoder.matches(request.getOldPassword(), customer.getPasswordHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Mật khẩu hiện tại không chính xác");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Xác nhận mật khẩu mới không khớp");
        }
        if (passwordEncoder.matches(request.getNewPassword(), customer.getPasswordHash())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Mật khẩu mới không được giống mật khẩu cũ");
        }

        customer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public MedicalProfileResponse updateMedicalProfile(UpdateMedicalProfileRequest request, Authentication authentication) {
        Customer customer = getCurrentCustomer(authentication);

        MedicalProfile medicalProfile = medicalProfileRepository.findByCustomerId(customer.getId())
                .orElseGet(() -> {
                    MedicalProfile newProfile = new MedicalProfile();
                    newProfile.setCustomerId(customer.getId());
                    return newProfile;
                });

        medicalProfile.setHeightCm(request.getHeightCm());
        medicalProfile.setWeightKg(request.getWeightKg());
        medicalProfile.setMedicalHistory(normalizeText(request.getMedicalHistory()));

        return buildMedicalResponse(medicalProfileRepository.save(medicalProfile));
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public ProfileResponse updateAvatar(MultipartFile file, Authentication authentication) {
        Customer customer = getCurrentCustomer(authentication);

        String oldAvatarUrl = customer.getAvatarUrl();
        String newAvatarUrl = fileStorageService.storeAvatar(file);

        customer.setAvatarUrl(newAvatarUrl);
        customer = customerRepository.save(customer);

        // Dọn file cũ SAU khi đã lưu DB thành công, tránh mất avatar nếu save() lỗi giữa chừng.
        fileStorageService.deleteAvatar(oldAvatarUrl);

        return buildProfileResponse(customer);
    }

    private ProfileResponse buildProfileResponse(Customer customer) {
        MedicalProfileResponse medicalResponse = medicalProfileRepository.findByCustomerId(customer.getId())
                .map(this::buildMedicalResponse)
                .orElse(new MedicalProfileResponse(null, null, null));

        return new ProfileResponse(customer.getId(), customer.getFullName(), customer.getPhoneNumber(),
                customer.getEmail(), customer.getAvatarUrl(), medicalResponse);
    }

    private MedicalProfileResponse buildMedicalResponse(MedicalProfile medicalProfile) {
        return new MedicalProfileResponse(medicalProfile.getHeightCm(), medicalProfile.getWeightKg(), medicalProfile.getMedicalHistory());
    }

    private String normalizeEmail(String email) {
        return (email == null || email.trim().isEmpty()) ? null : email.trim().toLowerCase();
    }

    private String normalizeText(String value) {
        return (value == null || value.trim().isEmpty()) ? null : value.trim();
    }
}
