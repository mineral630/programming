document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 가져오기
    const joinButton = document.getElementById('join-campaign-btn');
    const joinMessage = document.getElementById('join-message');
    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const agreeTermsCheckbox = document.getElementById('agree-terms'); 
    
    const findWasteBtn = document.getElementById('find-waste-btn'); 
    const searchRegionBtn = document.getElementById('search-region-btn'); 
    const searchInput = document.getElementById('search-input'); 
    const mapContainer = document.getElementById('map-container');
    const finderMessage = document.getElementById('finder-message');
    
    // 갤러리 관련 DOM 요소 및 전역 변수 정의
    const nextImpactImageBtn = document.getElementById('next-impact-image-btn');
    const showArticlesBtn = document.getElementById('show-articles-btn');
    const galleryContainer = document.querySelector('.environmental-impact-gallery');

    let joined = false; 
    let map = null; 
    let currentInfoWindow = null;   

    // 고정된 키워드 및 연결 URL 정의
    const fixedIssue = { keyword: "기후 변화", url: "climate_change.html" };

    // '다른 주제 보기' 버튼 클릭 이벤트 (고정 URL 연결 기능)
    if (nextImpactImageBtn) {
        galleryContainer.setAttribute('data-keyword', fixedIssue.keyword);
        
        nextImpactImageBtn.addEventListener('click', () => {
            galleryContainer.setAttribute('data-keyword', fixedIssue.keyword);
            window.location.href = fixedIssue.url; 
        });
    }

    // 2. 실천 서약하기 로직 
    joinButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        
        if (name === "") {
            joinMessage.innerText = "⚠️ 서약을 위해 이름을 입력해주세요.";
            joinMessage.style.display = 'block';
            joinMessage.style.color = '#dc3545';
            setTimeout(() => { joinMessage.style.display = 'none'; }, 3000);
            return; 
        }

        if (!agreeTermsCheckbox.checked) {
            joinMessage.innerText = "⚠️ 실천 서약 약관에 동의하셔야 캠페인에 참여할 수 있습니다.";
            joinMessage.style.display = 'block';
            joinMessage.style.color = '#dc3545';
            setTimeout(() => { joinMessage.style.display = 'none'; }, 3000);
            return; 
        }
        
        if (joined) {
            joinMessage.innerText = `${name} 님은 이미 서약에 참여하셨습니다. 지금 바로 실천을 시작하세요!`;
            joinMessage.style.color = '#007bff';
            joinMessage.style.display = 'block';
            
        } else {
            joinMessage.innerText = `${name} 님! 서약해주셔서 감사합니다. 당신의 실천이 지구를 지키는 큰 힘이 됩니다.`;
            joinMessage.style.display = 'block';
            joinMessage.style.color = '#28a745';
            joinButton.innerText = '서약 완료 ✔️';
            joinButton.disabled = true;
            joined = true;
        }
        
        setTimeout(() => { joinMessage.style.display = 'none'; }, 5000);
    });

    // ============================================================
    // 🗺️ 지도 및 검색 핵심 로직 (중고폰 필터링 추가)
    // ============================================================

    // [공통 함수] 지도 초기화 및 마커 표시 함수
    function searchNearbyBins(centerLat, centerLon, locationName = "지정 위치") {
        if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
            finderMessage.innerText = '❌ 카카오맵 API가 로드되지 않았습니다.';
            finderMessage.style.color = '#dc3545';
            finderMessage.style.display = 'block';
            return;
        }

        mapContainer.style.display = 'block';
        finderMessage.style.display = 'block';
        finderMessage.style.color = 'var(--secondary-blue)';
        finderMessage.innerText = `'${locationName}' 주변의 수거 장소를 스캔 중입니다...`;

        const centerPosition = new kakao.maps.LatLng(centerLat, centerLon);
        if (!map) {
            const mapOption = { center: centerPosition, level: 4 };
            map = new kakao.maps.Map(mapContainer, mapOption);
        } else {
            map.setCenter(centerPosition);
        }

        new kakao.maps.Marker({
            map: map,
            position: centerPosition,
            title: locationName,
            image: new kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
                new kakao.maps.Size(24, 35)
            )
        });

        const ps = new kakao.maps.services.Places(map);
        // 🟢 [수정] 중고 키워드 포함
        const keywords = ["쓰레기통", "분리수거", "수거함", "재활용", "수거함", "제로샵", "캔수거", "페트", "중고", "나눔터"];
        let resultCount = 0;
        let searchCompleteCount = 0;

        keywords.forEach(keyword => {
            ps.keywordSearch(keyword, (data, status) => {
                searchCompleteCount++;

                if (status === kakao.maps.services.Status.OK) {
                    
                    // 🟢 [추가된 핵심 로직] 중고폰 관련 결과 필터링
                    const filteredData = data.filter(place => {
                        // 장소 이름(place_name)에 '중고폰', '폰', '휴대폰'이 포함된 경우 제외
                        const name = place.place_name.toLowerCase();
                        if (name.includes('중고폰') || name.includes('폰') || name.includes('명품') || name.includes('스마트폰')) {
                            return false; // 제외
                        }
                        return true; // 포함
                    });
                    // 🟢 필터링된 데이터 사용
                    resultCount += filteredData.length;
                    
                    for (let i = 0; i < filteredData.length; i++) {
                        const place = filteredData[i]; // 필터링된 장소 데이터 사용

                        const marker = new kakao.maps.Marker({
                            map: map,
                            position: new kakao.maps.LatLng(place.y, place.x),
                            title: place.place_name
                        });

                        const address = place.road_address_name ? place.road_address_name : place.address_name;
                        
                        const content = `
                            <div style="padding:10px; min-width:200px; font-size:12px; line-height:1.5;">
                                <strong style="display:block; margin-bottom:5px; font-size:14px; color:#28a745;">${place.place_name}</strong>
                                <div style="color:#555; margin-bottom:5px;">${address}</div>
                                <a href="${place.place_url}" target="_blank" style="color:#007bff; text-decoration:none;">
                                    🔗 카카오맵에서 상세보기
                                </a>
                            </div>
                        `;

                        const infowindow = new kakao.maps.InfoWindow({ content: content, removable: true });

                        kakao.maps.event.addListener(marker, 'click', function() {
                            if (currentInfoWindow) {
                                currentInfoWindow.close();
                            }
                            infowindow.open(map, marker);
                            currentInfoWindow = infowindow;
                        });
                    }
                }

                if (searchCompleteCount === keywords.length) {
                    if (resultCount > 0) {
                        finderMessage.innerText = `✅ 검색 완료! 주변에서 ${resultCount}개의 관련 시설을 발견했습니다.`;
                        finderMessage.style.color = '#28a745';
                    } else {
                        finderMessage.innerText = `⚠️ '${locationName}' 주변 5km 반경 내에 등록된 수거 장소 데이터가 없습니다.`;
                        finderMessage.style.color = '#ffc107';
                    }
                    setTimeout(() => { finderMessage.style.display = 'none'; }, 5000);
                }
            }, { location: centerPosition, radius: 5000 });
        });
    }


    // 3. [이벤트] '현재 위치에서 찾기' 버튼 클릭
    findWasteBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            alert("브라우저가 위치 정보를 지원하지 않습니다.");
            return;
        }
        
        finderMessage.style.display = 'block';
        finderMessage.innerText = "GPS 신호 수신 중...";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                searchNearbyBins(lat, lon, "현재 위치");
            },
            (err) => {
                alert("위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
            }
        );
    });


    // 4. [이벤트] '지역 이동 & 검색' 버튼 클릭
    searchRegionBtn.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            alert("검색할 지역 이름(예: 강남역)을 입력해주세요!");
            return;
        }

        if (typeof kakao === 'undefined' || typeof kakao.maps === 'undefined') {
            alert("카카오맵 API가 로드되지 않았습니다.");
            return;
        }

        const ps = new kakao.maps.services.Places();

        ps.keywordSearch(keyword, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const target = data[0];
                const lat = target.y;
                const lon = target.x;
                searchNearbyBins(lat, lon, target.place_name);
                
            } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
                alert("검색 결과가 없습니다. 올바른 지역명을 입력해주세요.");
            } else {
                alert("검색 중 오류가 발생했습니다.");
            }
        });
    });
    
    // 엔터키 입력 시 검색 버튼 클릭 처리
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchRegionBtn.click();
        }
    });

    // 5. [이벤트] '관련 기사 보기' 버튼 클릭
    if (showArticlesBtn && galleryContainer) {
        showArticlesBtn.addEventListener('click', () => {
            const keyword = fixedIssue.keyword; 
            
            if (keyword && keyword !== 'undefined') {
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&tbm=nws`;
                window.open(searchUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
            } else {
                alert("키워드가 설정되지 않았습니다. 잠시 후 다시 시도해주세요.");
            }
        });
    }

});
