package com.naviksha.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;

import java.util.Properties;

@Configuration
public class EmailConfig {
    
    @Value("${spring.mail.host}")
    private String mailHost;
    
    @Value("${spring.mail.port}")
    private int mailPort;
    
    @Value("${spring.mail.username}")
    private String mailUsername;
    
    @Value("${spring.mail.password}")
    private String mailPassword;
    
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        
        // Gmail-specific configuration based on port
        if (mailPort == 465) {
            // Port 465 uses SSL (Gmail supports this)
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.ssl.required", "true");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.socketFactory.fallback", "false");
        } else {
            // Port 587 uses STARTTLS (Gmail recommended)
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        }
        
        // Connection timeouts (aggressive for fast failure - email is non-blocking)
        // Connection: 5 seconds - Fail fast if server is unreachable (connection errors)
        props.put("mail.smtp.connectiontimeout", "5000"); // 5 seconds
        // Read/IO: 10 seconds - Quick timeout for connection issues, still allows PDF upload
        props.put("mail.smtp.timeout", "10000"); // 10 seconds
        // Write: 15 seconds - Email with PDF attachment needs slightly more time for upload
        props.put("mail.smtp.writetimeout", "15000"); // 15 seconds
        
        // Gmail SSL trust settings
        props.put("mail.smtp.ssl.trust", "*"); // Trust all SSL certificates (Gmail uses valid certs)
        props.put("mail.smtp.ssl.checkserveridentity", "true");
        
        // Gmail-specific optimizations
        props.put("mail.smtp.quitwait", "false");
        
        // Debug (set to false in production, true for troubleshooting)
        props.put("mail.debug", "false");
        
        return mailSender;
    }
    
    @Bean
    public SpringTemplateEngine templateEngine() {
        SpringTemplateEngine templateEngine = new SpringTemplateEngine();
        templateEngine.setTemplateResolver(templateResolver());
        return templateEngine;
    }
    
    @Bean
    public ClassLoaderTemplateResolver templateResolver() {
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();
        templateResolver.setPrefix("templates/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode("HTML");
        templateResolver.setCharacterEncoding("UTF-8");
        templateResolver.setCacheable(false); // Set to true in production
        return templateResolver;
    }
}
