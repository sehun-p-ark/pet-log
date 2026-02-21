package dev.dhkim.petlog.mappers.main;

import dev.dhkim.petlog.dto.main.ReservationDto;
import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

@Mapper
public interface ReservationMapper {
    int insertReservation(ReservationDto reservation);
}

