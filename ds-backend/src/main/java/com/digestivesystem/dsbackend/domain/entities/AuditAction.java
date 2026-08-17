package com.digestivesystem.dsbackend.domain.entities;

/** Loại hành động được Audit Log ghi nhận (BR-02 module D.4 — chỉ ghi Create/Update/Delete). */
public enum AuditAction {
    CREATE,
    UPDATE,
    DELETE
}
