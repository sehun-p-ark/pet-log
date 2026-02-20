package dev.dhkim.petlog.services.shop;

@Service
public class BannerService {

    @Autowired
    private BannerMapper bannerMapper;

    public List<Map<String, Object>> getBannersByDeviceType(String deviceType) {
        return bannerMapper.selectBannersByDeviceType(deviceType);
    }
}