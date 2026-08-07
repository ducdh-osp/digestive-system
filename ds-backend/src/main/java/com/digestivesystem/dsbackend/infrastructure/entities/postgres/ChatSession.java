package com.digestivesystem.dsbackend.infrastructure.entities.postgres;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "chat_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "session_title")
    private String sessionTitle;

    @Column(name = "is_emergency")
    private Boolean isEmergency = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}
