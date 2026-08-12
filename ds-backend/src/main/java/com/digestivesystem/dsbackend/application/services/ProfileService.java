package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.dtos.request.ChangePasswordRequest;
import com.digestivesystem.dsbackend.application.dtos.request.UpdateMedicalProfileRequest;
import com.digestivesystem.dsbackend.application.dtos.request.UpdateProfileRequest;
import com.digestivesystem.dsbackend.application.dtos.response.MedicalProfileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ProfileResponse;
import com.digestivesystem.dsbackend.application.dtos.response.ProfileUpdateResponse;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.Customer;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.MedicalProfile;
import com.digestivesystem.dsbackend.infrastructure.repositories.postgres.CustomerRepository;
import com.digestivesystem.dsbackend.infrastructure.repositories.postgres.MedicalProfileRepository;
import com.digestivesystem.dsbackend.infrastructure.services.UserDetailsServiceImpl;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ProfileService {

    private static final String CUSTOMER_PREFIX = "CUSTOMER:";

    private final CustomerRepository customerRepository;
    private final MedicalProfileRepository medicalProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public ProfileService(
            CustomerRepository customerRepository,
            MedicalProfileRepository medicalProfileRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UserDetailsServiceImpl userDetailsService
    ) {
        this.customerRepository = customerRepository;
        this.medicalProfileRepository = medicalProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // ==========================================
    // 1. LẤY CUSTOMER ĐANG ĐĂNG NHẬP TỪ JWT
    // ==========================================
    private Customer getCurrentCustomer(Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new RuntimeException("UNAUTHORIZED");
        }

        String username = authentication.getName();

        if (username == null
                || !username.startsWith(CUSTOMER_PREFIX)) {
            throw new RuntimeException("UNAUTHORIZED");
        }

        // CUSTOMER:0987654321
        // ->
        // 0987654321
        String phoneNumber =
                username.substring(CUSTOMER_PREFIX.length());

        Customer customer = customerRepository
                .findByPhoneNumber(phoneNumber)
                .orElseThrow(
                        () -> new RuntimeException("USER_NOT_FOUND")
                );

        if (!Boolean.TRUE.equals(customer.getIsActive())) {
            throw new RuntimeException("USER_BANNED");
        }

        return customer;
    }

    // ==========================================
    // 2. XEM HỒ SƠ
    // ==========================================
    @Transactional(
            transactionManager = "postgresTransactionManager",
            readOnly = true
    )
    public ProfileResponse getProfile(
            Authentication authentication
    ) {

        Customer customer =
                getCurrentCustomer(authentication);

        return buildProfileResponse(customer);
    }

    // ==========================================
    // 3. CẬP NHẬT HỒ SƠ
    // ==========================================
    @Transactional(
            transactionManager = "postgresTransactionManager"
    )
    public ProfileUpdateResponse updateProfile(
            UpdateProfileRequest request,
            Authentication authentication
    ) {

        Customer customer =
                getCurrentCustomer(authentication);

        String newFullName =
                request.getFullName().trim();

        String newPhoneNumber =
                request.getPhoneNumber().trim();

        String newEmail =
                normalizeEmail(request.getEmail());

        // -------------------------------
        // Kiểm tra SĐT trùng
        // -------------------------------
        Optional<Customer> customerWithPhone =
                customerRepository.findByPhoneNumber(
                        newPhoneNumber
                );

        if (customerWithPhone.isPresent()
                && !customerWithPhone
                .get()
                .getId()
                .equals(customer.getId())) {

            throw new RuntimeException("PHONE_EXISTS");
        }

        // -------------------------------
        // Kiểm tra email trùng
        // -------------------------------
        if (newEmail != null) {

            Optional<Customer> customerWithEmail =
                    customerRepository
                            .findByEmailIgnoreCase(newEmail);

            if (customerWithEmail.isPresent()
                    && !customerWithEmail
                    .get()
                    .getId()
                    .equals(customer.getId())) {

                throw new RuntimeException("EMAIL_EXISTS");
            }
        }

        // -------------------------------
        // Update Customer
        // -------------------------------
        customer.setFullName(newFullName);
        customer.setPhoneNumber(newPhoneNumber);
        customer.setEmail(newEmail);

        customer =
                customerRepository.save(customer);

        // -------------------------------
        // Tạo token mới
        //
        // Vì JWT hiện dùng:
        // CUSTOMER:<phoneNumber>
        //
        // Nếu user đổi SĐT thì token cũ
        // không còn đúng nữa.
        // -------------------------------
        UserDetails userDetails =
                userDetailsService.loadUserByUsername(
                        CUSTOMER_PREFIX
                                + customer.getPhoneNumber()
                );

        String accessToken =
                jwtService.generateToken(userDetails);

        String refreshToken =
                jwtService.generateRefreshToken(userDetails);

        return new ProfileUpdateResponse(
                buildProfileResponse(customer),
                accessToken,
                refreshToken
        );
    }

    // ==========================================
    // 4. ĐỔI MẬT KHẨU
    // ==========================================
    @Transactional(
            transactionManager = "postgresTransactionManager"
    )
    public void changePassword(
            ChangePasswordRequest request,
            Authentication authentication
    ) {

        Customer customer =
                getCurrentCustomer(authentication);

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(
                request.getOldPassword(),
                customer.getPasswordHash()
        )) {

            throw new RuntimeException(
                    "OLD_PASSWORD_INVALID"
            );
        }

        // New password và Confirm phải giống nhau
        if (!request.getNewPassword()
                .equals(request.getConfirmPassword())) {

            throw new RuntimeException(
                    "PASSWORD_CONFIRM_NOT_MATCH"
            );
        }

        // Không cho mật khẩu mới giống mật khẩu cũ
        if (passwordEncoder.matches(
                request.getNewPassword(),
                customer.getPasswordHash()
        )) {

            throw new RuntimeException(
                    "NEW_PASSWORD_SAME_AS_OLD"
            );
        }

        // Hash mật khẩu mới
        customer.setPasswordHash(
                passwordEncoder.encode(
                        request.getNewPassword()
                )
        );

        customerRepository.save(customer);
    }

    // ==========================================
    // 5. CẬP NHẬT HỒ SƠ BỆNH LÝ
    // ==========================================
    @Transactional(
            transactionManager = "postgresTransactionManager"
    )
    public MedicalProfileResponse updateMedicalProfile(
            UpdateMedicalProfileRequest request,
            Authentication authentication
    ) {

        Customer customer =
                getCurrentCustomer(authentication);

        // Nếu đã có MedicalProfile -> lấy ra update
        // Nếu chưa có -> tạo mới
        MedicalProfile medicalProfile =
                medicalProfileRepository
                        .findByCustomer(customer)
                        .orElseGet(() -> {

                            MedicalProfile newProfile =
                                    new MedicalProfile();

                            newProfile.setCustomer(customer);

                            return newProfile;
                        });

        medicalProfile.setHeightCm(
                request.getHeightCm()
        );

        medicalProfile.setWeightKg(
                request.getWeightKg()
        );

        medicalProfile.setMedicalHistory(
                normalizeText(
                        request.getMedicalHistory()
                )
        );

        MedicalProfile saved =
                medicalProfileRepository.save(
                        medicalProfile
                );

        return buildMedicalResponse(saved);
    }

    // ==========================================
    // CHUYỂN CUSTOMER -> PROFILE RESPONSE
    // ==========================================
    private ProfileResponse buildProfileResponse(
            Customer customer
    ) {

        MedicalProfileResponse medicalResponse =
                medicalProfileRepository
                        .findByCustomer(customer)
                        .map(this::buildMedicalResponse)
                        .orElse(
                                new MedicalProfileResponse(
                                        null,
                                        null,
                                        null
                                )
                        );

        return new ProfileResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getPhoneNumber(),
                customer.getEmail(),
                medicalResponse
        );
    }

    // ==========================================
    // CHUYỂN MEDICAL PROFILE -> RESPONSE
    // ==========================================
    private MedicalProfileResponse buildMedicalResponse(
            MedicalProfile medicalProfile
    ) {

        return new MedicalProfileResponse(
                medicalProfile.getHeightCm(),
                medicalProfile.getWeightKg(),
                medicalProfile.getMedicalHistory()
        );
    }

    // ==========================================
    // CHUẨN HÓA EMAIL
    // ==========================================
    private String normalizeEmail(String email) {

        if (email == null
                || email.trim().isEmpty()) {
            return null;
        }

        return email
                .trim()
                .toLowerCase();
    }

    // ==========================================
    // CHUẨN HÓA TEXT
    // ==========================================
    private String normalizeText(String value) {

        if (value == null
                || value.trim().isEmpty()) {
            return null;
        }

        return value.trim();
    }
}