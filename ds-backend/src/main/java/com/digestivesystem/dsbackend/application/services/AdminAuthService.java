package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.dtos.request.AdminLoginRequest;
import com.digestivesystem.dsbackend.application.dtos.response.AdminAuthResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.application.exceptions.codes.AdminAuthMessageCodes;
import com.digestivesystem.dsbackend.application.exceptions.codes.CommonMessageCodes;
import com.digestivesystem.dsbackend.domain.entities.Admin;
import com.digestivesystem.dsbackend.domain.repositories.AdminRepository;
import com.digestivesystem.dsbackend.infrastructure.services.UserDetailsServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    public AdminAuthService(AdminRepository adminRepository, JwtService jwtService,
                            AuthenticationManager authenticationManager, UserDetailsServiceImpl userDetailsService) {
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
    }

    public AdminAuthResponse login(AdminLoginRequest request) {
        // Authenticate with prefix
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(SecurityConstants.ADMIN_PREFIX + request.getUsername(), request.getPassword())
        );

        Admin admin = adminRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, CommonMessageCodes.INVALID_CREDENTIALS));

        if (!admin.getIsActive()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, AdminAuthMessageCodes.ACCOUNT_DEACTIVATED);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(SecurityConstants.ADMIN_PREFIX + admin.getUsername());
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        AdminAuthResponse.AdminDto adminDto = new AdminAuthResponse.AdminDto(
                admin.getId(), admin.getUsername(), admin.getEmail(), admin.getRole().getRoleName()
        );

        return new AdminAuthResponse(accessToken, refreshToken, adminDto);
    }
}
