package com.naviksha.service;

import com.naviksha.model.Career;
import com.naviksha.repository.CareerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CareerService {
    
    private final CareerRepository careerRepository;
    
    public List<Career> getAllCareers() {
        return careerRepository.findAll();
    }
    
    public Career findByCareerId(String careerId) {
        return careerRepository.findByCareerId(careerId).orElse(null);
    }
    
    public Career findByCareerName(String careerName) {
        return careerRepository.findByCareerName(careerName).orElse(null);
    }
    
    public Career saveCareer(Career career) {
        return careerRepository.save(career);
    }
    
    public Career updateCareer(Career career) {
        return careerRepository.save(career);
    }
    
    public void deleteCareer(String careerId) {
        careerRepository.findByCareerId(careerId)
            .ifPresent(careerRepository::delete);
    }
}