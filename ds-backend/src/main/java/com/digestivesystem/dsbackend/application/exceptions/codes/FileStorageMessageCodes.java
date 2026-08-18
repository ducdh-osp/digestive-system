package com.digestivesystem.dsbackend.application.exceptions.codes;

/** Mã lỗi riêng của LocalFileStorageService (upload avatar). */
public final class FileStorageMessageCodes {

    public static final String FILE_REQUIRED = "error.fileStorage.file-required";
    public static final String FILE_TOO_LARGE = "error.fileStorage.file-too-large";
    public static final String INVALID_FILE_TYPE = "error.fileStorage.invalid-file-type";
    public static final String SAVE_FAILED = "error.fileStorage.save-failed";

    private FileStorageMessageCodes() {
    }
}
