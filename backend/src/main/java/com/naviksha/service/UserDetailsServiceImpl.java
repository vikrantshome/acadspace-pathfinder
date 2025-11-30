package com.naviksha.service;

import com.naviksha.model.User;
import com.naviksha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByStudentID(username)
                .or(() -> userRepository.findByMobileNo(username))
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getId(),
                user.getPassword(),
                user.isActive(),
                true,
                true,
                true,
                mapRolesToAuthorities(user.getRoles())
        );
    }

    private Collection<? extends GrantedAuthority> mapRolesToAuthorities(Collection<String> roles) {
        return roles.stream()
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    public UserDetails loadUserById(String id) throws UsernameNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + id));

        return new org.springframework.security.core.userdetails.User(
                user.getId(),
                user.getPassword(),
                user.isActive(),
                true,
                true,
                true,
                mapRolesToAuthorities(user.getRoles())
        );
    }
}