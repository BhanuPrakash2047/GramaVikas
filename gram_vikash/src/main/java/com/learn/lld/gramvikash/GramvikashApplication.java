package com.learn.lld.gramvikash;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GramvikashApplication {
    public static void main(String[] args) {
        SpringApplication.run(GramvikashApplication.class, args);
    }
}
