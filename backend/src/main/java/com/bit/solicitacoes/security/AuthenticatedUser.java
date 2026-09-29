package com.bit.solicitacoes.security;

import com.bit.solicitacoes.entity.Usuario;
import com.bit.solicitacoes.enums.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class AuthenticatedUser implements UserDetails {
    private final UUID id;
    private final String username;
    private final String password;
    private final Role role;

    public AuthenticatedUser(Usuario usuario) {
        this.id = usuario.getId();
        this.username = usuario.getUsername();
        this.password = usuario.getPassword();
        this.role = usuario.getRole();
    }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
}
