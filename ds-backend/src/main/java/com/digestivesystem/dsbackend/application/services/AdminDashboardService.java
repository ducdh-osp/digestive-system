package com.digestivesystem.dsbackend.application.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.application.dtos.response.DashboardSummaryResponse;
import com.digestivesystem.dsbackend.application.exceptions.BusinessException;
import com.digestivesystem.dsbackend.application.exceptions.codes.CommonMessageCodes;
import com.digestivesystem.dsbackend.domain.repositories.AdminRepository;
import com.digestivesystem.dsbackend.domain.repositories.CustomerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

/** Số liệu tổng quan cho Trang tổng quan CMS — chỉ số tổng hợp (count), không lộ dữ liệu chi tiết. */
@Service
public class AdminDashboardService {

    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;

    public AdminDashboardService(CustomerRepository customerRepository, AdminRepository adminRepository) {
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
    }

    public DashboardSummaryResponse summary(Authentication authentication) {
        requireAdmin(authentication);
        long totalCustomers = customerRepository.count();
        long totalAdmins = adminRepository.findAll().size();
        return new DashboardSummaryResponse(totalCustomers, totalAdmins);
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getName() == null
                || !authentication.getName().startsWith(SecurityConstants.ADMIN_PREFIX)) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, CommonMessageCodes.NOT_AUTHENTICATED);
        }
    }
}
