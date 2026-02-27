package dev.dhkim.petlog.services.myPage;

import ch.qos.logback.core.spi.FilterAttachableImpl;
import dev.dhkim.petlog.dto.user.*;
import dev.dhkim.petlog.entities.user.*;
import dev.dhkim.petlog.mappers.myPage.MyPageMapper;
import dev.dhkim.petlog.mappers.user.UserMapper;
import dev.dhkim.petlog.results.MyPageResult;
import dev.dhkim.petlog.utils.PhoneUtil;
import dev.dhkim.petlog.validators.UserValidator;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.dao.annotation.PersistenceExceptionTranslationPostProcessor;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MyPageService {
    private final MyPageMapper myPageMapper;
    private final UserMapper userMapper;

    public boolean verifyPassword(int userId, String password) {
        if (userId < 1 ||
                !UserValidator.validatePassword(password)) {
            return false;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return false;
        }
        return BCrypt.checkpw(password, dbUser.getPassword());
    }


    public Pair<MyPageResult, UserEntity> getUser(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbUser);
    }

    public Pair<MyPageResult, PersonalUserEntity> getPersonalUser(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        PersonalUserEntity dbUser = this.myPageMapper.selectPersonalByUserId(userId);
        if (dbUser == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbUser);
    }


    // 개인회원 주소 가져오기
    public Pair<MyPageResult, List<AddressEntity>> getPersonalAddress(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        List<AddressEntity> dbPersonalAddresses = this.myPageMapper.selectPersonalAddressesByUserId(userId);
        if (dbPersonalAddresses == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbPersonalAddresses);
    }


    // 사업자회원 주소 가져오기
    public Pair<MyPageResult, AddressEntity> getBusinessAddress(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        AddressEntity dbBusinessAddress = this.myPageMapper.selectBusinessAddressByUserId(userId);
        if (dbBusinessAddress == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbBusinessAddress);
    }


    public Pair<MyPageResult, PetEntity> getPrimaryPet(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        PetEntity dbPet = this.myPageMapper.selectPrimaryPetByUserId(userId);
        return Pair.of(MyPageResult.SUCCESS, dbPet);
    }

    public Pair<MyPageResult, List<PetEntity>> getPets(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        List<PetEntity> dbPets = this.myPageMapper.selectPetsByUserId(userId);
        return Pair.of(MyPageResult.SUCCESS, dbPets);
    }

    public MyPageResult deletePet(int petId, int userId) {
        if (petId < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        PetEntity dbPet = this.myPageMapper.selectByPetIdAndUserId(petId, userId);
        if (dbPet == null) {
            return MyPageResult.FAILURE;
        }
        boolean primaryPet = dbPet.getIsPrimary();
        int delete = this.myPageMapper.deletePet(petId, userId);

        if (delete < 1) {
            return MyPageResult.FAILURE;
        }

        if (primaryPet) {
            List<PetEntity> pets = this.myPageMapper.selectPetsByUserId(userId);
            if (pets != null && !pets.isEmpty()) {
                PetEntity firstPet = pets.get(0);
                int updatePetPrimary = this.myPageMapper.updatePrimary(firstPet.getPetId(), userId);
                if (updatePetPrimary < 1) {
                    return MyPageResult.FAILURE;
                }
            }
        }
        return MyPageResult.SUCCESS;
    }

    public Pair<MyPageResult, Integer> insertPetInMyPage(int userId, PetDto pet) {
        if (userId < 1 ||
                pet == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        List<PetEntity> pets = this.myPageMapper.selectPetsByUserId(userId);
        if (pets == null || pets.isEmpty()) {
            pet.setIsPrimary(true);
        }
        return this.userMapper.insertPet(userId, pet) > 0
                ? Pair.of(MyPageResult.SUCCESS, pet.getPetId())
                : Pair.of(MyPageResult.FAILURE, null);
    }


    public Pair<MyPageResult, PetEntity> getPet(int petId, int userId) {
        PetEntity dbPet = this.myPageMapper.selectByPetIdAndUserId(petId, userId);
        if (dbPet == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbPet);
    }

    public MyPageResult updatePet(PetEntity pet, int userId) {
        if (pet.getPetId() < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.updatePet(pet, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;


    }

    public MyPageResult changePrimaryPet(int petId, int userId) {
        if (petId < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        PetEntity dbPet = this.myPageMapper.selectByPetIdAndUserId(petId, userId);
        if (dbPet == null) {
            return MyPageResult.FAILURE;
        }
        if (dbPet.getIsPrimary()) {
            return MyPageResult.SUCCESS;
        }
        this.myPageMapper.updatePetsNoPrimary(userId);

        return this.myPageMapper.updatePrimary(petId, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }


    /*------------- 내정보 관리(개인회원)---------------*/

    // 이름 변경
    public MyPageResult changeName(String name, String password, int userId) {
        if (!UserValidator.validateName(name) ||
                !UserValidator.validatePassword(password) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.updateName(name, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }

    // 닉네임 변경
    public MyPageResult changeNickname(String nickname, int userId) {
        if (!UserValidator.validateNickname(nickname) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        PersonalUserEntity dbNickname = this.myPageMapper.selectNicknameByNickname(nickname);
        if (dbNickname != null) {
            return MyPageResult.FAILURE_NICKNAME_DUPLICATE;
        }

        return this.myPageMapper.updateNickname(nickname, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }


    // 전화번호 변경
    public MyPageResult changePhone(String phone, String password, int userId) {
        if (!UserValidator.validatePhone(phone) ||
                !UserValidator.validatePassword(password) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbPhone = this.myPageMapper.selectPhoneByPhone(phone);
        if (dbPhone != null) {
            return MyPageResult.FAILURE_PHONE_DUPLICATE;
        }
        return this.myPageMapper.updatePhone(phone, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }


    // 대표주소 하나 불러오기
    public Pair<MyPageResult, AddressEntity> getDefaultAddress(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        AddressEntity dbDefaultAddress = this.myPageMapper.selectDefaultAddressByUserId(userId);
        if (dbDefaultAddress == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbDefaultAddress);
    }

    // 대표주소로 변경
    public MyPageResult changeDefaultAddress(int addressId, int userId) {
        if (addressId < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        AddressEntity dbAddress = this.myPageMapper.selectPersonalAddressByAddressId(addressId);

        if (dbAddress == null || dbAddress.getUserId() != userId) {
            return MyPageResult.FAILURE;
        }

        this.myPageMapper.updateAllDefaultAddressFalse(userId);
        return this.myPageMapper.updateDefaultAddress(addressId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;

    }

    // 기본주소 추가 등록
    public MyPageResult postAddress(AddressDto addressDto, int userId) {
        if (!UserValidator.validateAddress(addressDto) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        List<AddressEntity> dbPersonalAddresses = this.myPageMapper.selectPersonalAddressesByUserId(userId);
        if (dbPersonalAddresses.size() >= 5) {
            return MyPageResult.FAILURE;
        }
        addressDto.setDefault(false);
        return this.myPageMapper.insertPersonalAddress(addressDto, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }

    // 기본주소 수정
    public MyPageResult patchAddress(int addressId, AddressDto address, int userId) {
        if (!UserValidator.validateAddress(address) ||
                addressId < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.updateAddress(addressId, address, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }

    // 기본주소 삭제
    @Transactional
    public MyPageResult deleteAddress(int addressId, int userId) {
        if (addressId < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        List<AddressEntity> dbAddresses = this.myPageMapper.selectPersonalAddressesByUserId(userId);
        if (dbAddresses.size() == 1) {
            return MyPageResult.FAILURE;
        }

        AddressEntity dbAddress = this.myPageMapper.selectPersonalAddressByAddressId(addressId);
        if (dbAddress == null) {
            return MyPageResult.FAILURE;
        }
        boolean wasIsDefault = dbAddress.isDefault();

        int delete = this.myPageMapper.deleteAddress(addressId, userId);
        if (delete <= 0) {
            return MyPageResult.FAILURE;
        }
        if (wasIsDefault) {
            List<AddressEntity> dbRemain = this.myPageMapper.selectPersonalAddressesByUserId(userId);
            int newDefaultId = dbRemain.get(0).getAddressId();
            this.myPageMapper.updateDefaultAddress(newDefaultId);
        }
        return MyPageResult.SUCCESS;
    }


    // 대표배송지로 변경
    public MyPageResult changeDefaultDelivery(int addressId, int userId) {
        if (addressId < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        DeliveryAddressEntity dbAddress = this.myPageMapper.selectDeliveryAddressByDeliveryAddressIdAndUserId(addressId, userId);

        if (dbAddress == null) {
            return MyPageResult.FAILURE;
        }

        this.myPageMapper.updateAllDeliveryDefaultFalse(userId);
        return this.myPageMapper.updateDeliveryDefault(addressId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;

    }

    // 배송지 다 불러오기
    public Pair<MyPageResult, List<DeliveryAddressEntity>> getAllDeliveryAddress(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        List<DeliveryAddressEntity> dbDeliveryAddresses = this.myPageMapper.selectDeliveryAddressesByUserId(userId);
        if (dbDeliveryAddresses == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        for (DeliveryAddressEntity dbDeliveryAddress : dbDeliveryAddresses) {
            dbDeliveryAddress.setPhone(PhoneUtil.phoneNumberFormat(dbDeliveryAddress.getPhone()));
        }
        return Pair.of(MyPageResult.SUCCESS, dbDeliveryAddresses);
    }

    // 기본 배송지만 불러오기
    public Pair<MyPageResult, DeliveryAddressEntity> getDeliveryAddress(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        DeliveryAddressEntity dbDeliveryAddress = this.myPageMapper.selectPrimaryDeliveryAddressByUserId(userId);
        if (dbDeliveryAddress == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbDeliveryAddress);
    }

    // 배송지 삭제
    public MyPageResult deleteDeliveryAddress(int deliveryAddressId, int userId) {
        if (deliveryAddressId < 1 ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        DeliveryAddressEntity dbDeliveryAddress = this.myPageMapper.selectDeliveryAddressByDeliveryAddressIdAndUserId(deliveryAddressId, userId);
        if (dbDeliveryAddress == null) {
            return MyPageResult.FAILURE;
        }
        boolean wasDefault = dbDeliveryAddress.isDefault();
        int delete = this.myPageMapper.deleteDeliveryAddress(deliveryAddressId, userId);
        if (delete <= 0) {
            return MyPageResult.FAILURE;
        }
        if (wasDefault) {
            DeliveryAddressEntity dbOldestDeliveryAddress = this.myPageMapper.selectOldestDeliveryAddressByUserId(userId);

            if (dbOldestDeliveryAddress != null) {
                this.myPageMapper.updateDefaultDeliveryAddress(dbOldestDeliveryAddress.getDeliveryAddressId(), userId);
            }
        }
        return MyPageResult.SUCCESS;
    }

    // 배송지 수정
    public MyPageResult patchDeliveryAddress(int deliveryAddressId, DeliveryAddressEntity deliveryAddress, int userId) {
        if (deliveryAddressId < 1 ||
                userId < 1 ||
                !UserValidator.validateDeliveryAddress(deliveryAddress)) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.updateDeliveryAddress(deliveryAddressId, deliveryAddress, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }


    // 배송지 등록
    public Pair<MyPageResult, DeliveryAddressEntity> postDeliveryAddress(DeliveryAddressEntity deliveryAddress, int userId) {
        if (!UserValidator.validateDeliveryAddress(deliveryAddress) ||
                userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        List<DeliveryAddressEntity> dbDeliveryAddresses = this.myPageMapper.selectDeliveryAddressesByUserId(userId);
        if (dbDeliveryAddresses.isEmpty()) {
            deliveryAddress.setDefault(true);
        }

        return this.myPageMapper.insertDeliveryAddress(deliveryAddress, userId) > 0
                ? Pair.of(MyPageResult.SUCCESS, deliveryAddress)
                : Pair.of(MyPageResult.FAILURE, null);
    }

    // 비밀번호 변경
    public MyPageResult changePassword(String password, String newPassword, int userId) {
        if (!UserValidator.validatePassword(password) ||
                !UserValidator.validatePassword(newPassword) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }


        if (BCrypt.checkpw(newPassword, dbUser.getPassword())) {
            return MyPageResult.FAILURE_PASSWORD_DUPLICATE;
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(); // BCrypt 암호화(해싱)를 위한 객체

        String hashedPassword = encoder.encode(newPassword); // 비밀번호 암호문("$2a$...")

        return this.myPageMapper.updatePassword(hashedPassword, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }


    // 회원 탈퇴
    public MyPageResult deleteUser(String password, int userId) {
        if (!UserValidator.validatePassword(password) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.deleteUser(userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }


    // 예약 집어넣기
    public MyPageResult postReservation(MyPageReservationDto reservationDto) {
        return MyPageResult.SUCCESS;
    }


    // 예약 가져오기
    public Pair<MyPageResult, List<MyPageReservationDto>> getReservation(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        List<MyPageReservationDto> dbReservations = this.myPageMapper.selectAllReservationByUserId(userId);
        for (MyPageReservationDto dbReservation : dbReservations) {
            dbReservation.setStorePhone(PhoneUtil.phoneNumberFormat(dbReservation.getStorePhone()));
        }
        return Pair.of(MyPageResult.SUCCESS, dbReservations);
    }


    /*----------------------------사업자 정보 관리------------------------------------*/
    // 기업명 변경
    public MyPageResult changeCompanyName(String companyName, String password, int userId) {
        if (!UserValidator.validateCompanyName(companyName) ||
                !UserValidator.validatePassword(password) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.updateCompanyName(companyName, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }

    // 대표자명 변경
    public MyPageResult changeRepresentativeName(String representativeName, String password, int userId) {
        if (!UserValidator.validateRepresentativeName(representativeName) ||
                !UserValidator.validatePassword(password) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.updateRepresentativeName(representativeName, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }


    // 회사 주소 변경
    public MyPageResult changeCompanyAddress(String postalCode, String addressPrimary, String addressSecondary, String password, int userId) {
        if (!UserValidator.validateMemberPostalCode(postalCode) ||
                !UserValidator.validateMemberAddressPrimary(addressPrimary) ||
                !UserValidator.validateMemberAddressSecondary(addressSecondary) ||
                !UserValidator.validatePassword(password) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }

        return this.myPageMapper.updateCompanyAddress(postalCode, addressPrimary, addressSecondary, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }

    // 가게등록
    public MyPageResult postStore(StoreDto store, int userId) {
        if (store.getAddressSecondary() != null &&
                store.getAddressSecondary().isBlank()) {
            store.setAddressSecondary(null);
        }
        if (!UserValidator.validateStoreForRegistration(store) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.insertStore(store, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;

    }

    // 가게 수정
    public MyPageResult modifyStore(int storeId, StoreDto store, int userId) {
        if (storeId < 1 ||
                !UserValidator.validateStoreForRegistration(store) ||
                userId < 1) {
            System.out.println(store.getStoreName());
            System.out.println(store.getPostalCode());
            System.out.println(store.getAddressPrimary());
            System.out.println(store.getAddressSecondary());
            System.out.println(store.getCategory());
            System.out.println(store.getStorePhone());
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.updateStore(storeId, store, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }

    // 가게 삭제
    public MyPageResult deleteStore(int storeId, String password, int userId) {
        if (storeId < 1 ||
                !UserValidator.validatePassword(password) ||
                userId < 1) {
            return MyPageResult.FAILURE;
        }
        UserEntity dbUser = this.myPageMapper.selectByUserId(userId);
        if (dbUser == null) {
            return MyPageResult.FAILURE;
        }
        if (!BCrypt.checkpw(password, dbUser.getPassword())) {
            return MyPageResult.FAILURE;
        }
        return this.myPageMapper.deleteStore(storeId, userId) > 0
                ? MyPageResult.SUCCESS
                : MyPageResult.FAILURE;
    }

    // 가게 가져오기
    public Pair<MyPageResult, List<StoreEntity>> getStores(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        List<StoreEntity> dbStores = this.myPageMapper.selectStoresByUserId(userId);
        if (dbStores == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        for (StoreEntity dbStore : dbStores) {
            dbStore.setStorePhone(PhoneUtil.phoneNumberFormat(dbStore.getStorePhone()));
        }
        return Pair.of(MyPageResult.SUCCESS, dbStores);
    }


    // 사업자 회원 정보 가져오기
    public Pair<MyPageResult, BusinessUserEntity> getBusinessUser(int userId) {
        if (userId < 1) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        BusinessUserEntity dbBusinessUser = this.myPageMapper.selectBusinessByUserId(userId);
        if (dbBusinessUser == null) {
            return Pair.of(MyPageResult.FAILURE, null);
        }
        return Pair.of(MyPageResult.SUCCESS, dbBusinessUser);
    }
}
