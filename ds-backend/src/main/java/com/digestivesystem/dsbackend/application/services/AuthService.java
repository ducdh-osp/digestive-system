package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.dtos.request.ForgotPasswordRequest;
import com.digestivesystem.dsbackend.application.dtos.request.LoginRequest;
import com.digestivesystem.dsbackend.application.dtos.request.RegisterRequest;
import com.digestivesystem.dsbackend.application.dtos.request.ResetPasswordRequest;
import com.digestivesystem.dsbackend.application.dtos.request.VerifyOtpRequest;
import com.digestivesystem.dsbackend.application.dtos.response.AuthResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.Customer;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.OtpLog;
import com.digestivesystem.dsbackend.infrastructure.repositories.postgres.CustomerRepository;
import com.digestivesystem.dsbackend.infrastructure.repositories.postgres.OtpLogRepository;
import com.digestivesystem.dsbackend.infrastructure.services.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final OtpLogRepository otpLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    public AuthService(CustomerRepository customerRepository, OtpLogRepository otpLogRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService,
                       AuthenticationManager authenticationManager, UserDetailsServiceImpl userDetailsService) {
        this.customerRepository = customerRepository;
        this.otpLogRepository = otpLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public void register(RegisterRequest request) {
        if (customerRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BusinessException(HttpStatus.CONFLICT, "Số điện thoại đã tồn tại");
        }

        // Limit spam: max 5 times a day
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long count = otpLogRepository.countByPhoneNumberAndCreatedAtAfter(request.getPhoneNumber(), startOfDay);
        if (count >= 5) {
            throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS, "Bạn đã vượt quá số lần nhận mã trong ngày.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpLog otpLog = new OtpLog();
        otpLog.setPhoneNumber(request.getPhoneNumber());
        otpLog.setOtpCode(otp);
        otpLog.setExpiresAt(LocalDateTime.now().plusSeconds(180));
        otpLog.setIsUsed(false);

        otpLogRepository.save(otpLog);

        // Mock SMS
        System.out.println("==================================================");
        System.out.println("GỬI SMS TỚI SĐT: " + request.getPhoneNumber());
        System.out.println("MÃ OTP CỦA BẠN LÀ: " + otp);
        System.out.println("==================================================");
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        OtpLog otpLog = otpLogRepository.findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                request.getPhoneNumber(), request.getOtpCode(), LocalDateTime.now())
                .orElseGet(() -> {
                    boolean matchesButExpired = otpLogRepository
                            .findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseOrderByCreatedAtDesc(
                                    request.getPhoneNumber(), request.getOtpCode())
                            .isPresent();
                    if (matchesButExpired) {
                        throw new BusinessException(HttpStatus.GONE, "Mã xác thực đã hết hạn");
                    }
                    throw new BusinessException(HttpStatus.BAD_REQUEST, "Mã xác thực không đúng");
                });

        otpLog.setIsUsed(true);
        otpLogRepository.save(otpLog);

        // Create Customer
        Customer customer = new Customer();
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setFullName(request.getFullName());
        customer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        customer.setIsActive(true);

        customer = customerRepository.save(customer);

        UserDetails userDetails = userDetailsService.loadUserByUsername(customer.getPhoneNumber());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        AuthResponse.CustomerDto customerDto = new AuthResponse.CustomerDto(
                customer.getId(), customer.getFullName(), customer.getPhoneNumber());

        return new AuthResponse(accessToken, refreshToken, customerDto);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(SecurityConstants.CUSTOMER_PREFIX + request.getPhoneNumber(), request.getPassword())
        );

        Customer customer = customerRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "Tài khoản hoặc mật khẩu không chính xác."));

        if (!customer.getIsActive()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(SecurityConstants.CUSTOMER_PREFIX + customer.getPhoneNumber());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        AuthResponse.CustomerDto customerDto = new AuthResponse.CustomerDto(
                customer.getId(), customer.getFullName(), customer.getPhoneNumber());

        return new AuthResponse(accessToken, refreshToken, customerDto);
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public void forgotPassword(ForgotPasswordRequest request) {
        Customer customer = customerRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Số điện thoại không tồn tại"));

        if (!customer.getIsActive()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ CSKH.");
        }

        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long count = otpLogRepository.countByPhoneNumberAndCreatedAtAfter(request.getPhoneNumber(), startOfDay);
        if (count >= 5) {
            throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS, "Bạn đã vượt quá số lần nhận mã trong ngày.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));

        OtpLog otpLog = new OtpLog();
        otpLog.setPhoneNumber(request.getPhoneNumber());
        otpLog.setOtpCode(otp);
        otpLog.setExpiresAt(LocalDateTime.now().plusSeconds(180));
        otpLog.setIsUsed(false);

        otpLogRepository.save(otpLog);

        System.out.println("==================================================");
        System.out.println("GỬI SMS QUÊN MẬT KHẨU TỚI SĐT: " + request.getPhoneNumber());
        System.out.println("MÃ OTP CỦA BẠN LÀ: " + otp);
        System.out.println("==================================================");
    }

    @Transactional(transactionManager = "postgresTransactionManager")
    public void resetPassword(ResetPasswordRequest request) {
        OtpLog otpLog = otpLogRepository.findFirstByPhoneNumberAndOtpCodeAndIsUsedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                request.getPhoneNumber(), request.getOtpCode(), LocalDateTime.now())
                .orElseThrow(() -> new BusinessException(HttpStatus.BAD_REQUEST, "Mã xác thực không đúng hoặc đã hết hạn"));

        otpLog.setIsUsed(true);
        otpLogRepository.save(otpLog);

        Customer customer = customerRepository.findByPhoneNumber(request.getPhoneNumber())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "Số điện thoại không tồn tại"));

        customer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);
    }
}
