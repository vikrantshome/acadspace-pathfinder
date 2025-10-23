package com.naviksha.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * RestTemplate Configuration
 * 
 * Configures RestTemplate for external service calls
 */
@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate(AIServiceConfig aiServiceConfig) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(aiServiceConfig.getTimeout());
        factory.setReadTimeout(aiServiceConfig.getTimeout());
        
        return new RestTemplate(factory);
    }
}
