package com.healthcare.healthcare_system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose the "uploads" directory
        Path uploadDir = Paths.get("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();
        
        if (uploadDir.toFile().exists() || uploadDir.toFile().mkdirs()) {
             registry.addResourceHandler("/uploads/**")
                     .addResourceLocations(uploadDir.toUri().toString() + "/");
        }
    }
}
