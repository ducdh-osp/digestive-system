package com.digestivesystem.dsbackend.infrastructure.services;

import com.digestivesystem.dsbackend.application.constants.SecurityConstants;
import com.digestivesystem.dsbackend.infrastructure.entities.mysql.Admin;
import com.digestivesystem.dsbackend.infrastructure.entities.postgres.Customer;
import com.digestivesystem.dsbackend.infrastructure.repositories.mysql.AdminRepository;
import com.digestivesystem.dsbackend.infrastructure.repositories.postgres.CustomerRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final AdminRepository adminRepository;

    public UserDetailsServiceImpl(CustomerRepository customerRepository, AdminRepository adminRepository) {
        this.customerRepository = customerRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String usernameWithPrefix) throws UsernameNotFoundException {
        if (usernameWithPrefix.startsWith(SecurityConstants.ADMIN_PREFIX)) {
            String actualUsername = usernameWithPrefix.substring(SecurityConstants.ADMIN_PREFIX.length());
            Admin admin = adminRepository.findByUsernameOrEmail(actualUsername, actualUsername)
                    .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + actualUsername));
            return new User(usernameWithPrefix, admin.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_" + admin.getRole().getRoleName())));
        } else if (usernameWithPrefix.startsWith(SecurityConstants.CUSTOMER_PREFIX)) {
            String phone = usernameWithPrefix.substring(SecurityConstants.CUSTOMER_PREFIX.length());
            Customer customer = customerRepository.findByPhoneNumber(phone)
                    .orElseThrow(() -> new UsernameNotFoundException("Customer not found: " + phone));
            return new User(usernameWithPrefix, customer.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        } else {
            // Trường hợp không có prefix (backward compatibility)
            Customer customer = customerRepository.findByPhoneNumber(usernameWithPrefix)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + usernameWithPrefix));
            return new User(SecurityConstants.CUSTOMER_PREFIX + customer.getPhoneNumber(), customer.getPasswordHash(), List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
        }
    }
}
