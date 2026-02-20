package dev.dhkim.petlog.enums.cs;

public enum InquiryStatus {

    WAITING("접수됨"),
    COMPLETED("완료");

    private final String label;

    InquiryStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
