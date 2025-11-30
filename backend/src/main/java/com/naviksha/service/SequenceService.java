package com.naviksha.service;

import com.naviksha.model.Sequence;
import com.naviksha.repository.SequenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SequenceService {

    private final SequenceRepository sequenceRepository;

    public String getNextStudentID() {
        Sequence sequence = sequenceRepository.findAll().stream().findFirst().orElse(null);
        if (sequence == null) {
            sequence = new Sequence();
            sequence.setLastStudentID("AA0000");
        }

        String lastStudentID = sequence.getLastStudentID();
        String prefix = lastStudentID.substring(0, 2);
        int number = Integer.parseInt(lastStudentID.substring(2));

        number++;

        if (number > 9999) {
            number = 0;
            char firstChar = prefix.charAt(0);
            char secondChar = prefix.charAt(1);
            if (secondChar == 'Z') {
                secondChar = 'A';
                firstChar++;
            } else {
                secondChar++;
            }
            prefix = "" + firstChar + secondChar;
        }

        String nextStudentID = prefix + String.format("%04d", number);
        sequence.setLastStudentID(nextStudentID);
        sequenceRepository.save(sequence);

        return nextStudentID;
    }
}
