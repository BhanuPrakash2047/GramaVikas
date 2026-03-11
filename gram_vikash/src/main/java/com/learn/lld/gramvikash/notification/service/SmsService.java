package com.learn.lld.gramvikash.notification.service;

import com.learn.lld.gramvikash.common.config.TwilioConfig;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends SMS messages to farmers via Twilio.
 * All Indian numbers are prefixed with +91 automatically.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final TwilioConfig twilioConfig;

    private static final String INDIA_PREFIX = "+91";

    /**
     * Send an SMS asynchronously so it doesn't block the main notification flow.
     *
     * @param phoneNumber the farmer's 10-digit mobile number (without country code)
     * @param messageBody the text to send
     */
    @Async
    public void sendSms(String phoneNumber, String messageBody) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            log.warn("SMS skipped: phone number is null/blank");
            return;
        }

        String formattedNumber = formatIndianNumber(phoneNumber);

        try {
            Message message = Message.creator(
                    new PhoneNumber(formattedNumber),
                    new PhoneNumber(twilioConfig.getPhoneNumber()),
                    messageBody
            ).create();

            log.info("SMS sent to {} | SID: {}", formattedNumber, message.getSid());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", formattedNumber, e.getMessage());
        }
    }

    /**
     * Formats the phone number to E.164 Indian format (+91XXXXXXXXXX).
     */
    private String formatIndianNumber(String phone) {
        // Strip non-digits
        String digits = phone.replaceAll("[^0-9]", "");

        // If already has 91 prefix and is 12 digits, just prepend +
        if (digits.startsWith("91") && digits.length() == 12) {
            return "+" + digits;
        }

        // Take last 10 digits and prepend +91
        if (digits.length() >= 10) {
            digits = digits.substring(digits.length() - 10);
        }

        return INDIA_PREFIX + digits;
    }
}
