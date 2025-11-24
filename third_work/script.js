document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 가져오기 (수정: name-input, phone-input 추가)
    const joinButton = document.getElementById('join-campaign-btn');
    const joinMessage = document.getElementById('join-message');
    const nameInput = document.getElementById('name-input'); // 추가
    const phoneInput = document.getElementById('phone-input'); // 추가
    
    const findWasteBtn = document.getElementById('find-waste-btn'); // 현재 위치 버튼
    const searchRegionBtn = document.getElementById('search-region-btn'); // 지역 검색 버튼
    const searchInput = document.getElementById('search-input'); // 검색어 입력창
    const mapContainer = document.getElementById('map-container');
    const finderMessage = document.getElementById('finder-message');
    
    // 갤러리 관련 DOM 요소 및 전역 변수 정의
    const nextImpactImageBtn = document.getElementById('next-impact-image-btn');
    const showArticlesBtn = document.getElementById('show-articles-btn');
    const galleryContainer = document.querySelector('.environmental-impact-gallery');

    let joined = false;
    let map = null; // 지도 객체를 전역으로 관리
    let currentInfoWindow = null;   

    // 고정된 키워드 및 연결 URL 정의
    const fixedIssue = { keyword: "기후 변화", url: "example.html" };

    // '다른 주제 보기' 버튼 클릭 이벤트 (고정 URL 연결 기능)
    if (nextImpactImageBtn) {
        
        // 초기 설정: 고정 키워드를 적용
        galleryContainer.setAttribute('data-keyword', fixedIssue.keyword);
        
        nextImpactImageBtn.addEventListener('click', () => {
            
            // 1. 키워드 업데이트 (고정 키워드 유지)
            galleryContainer.setAttribute('data-keyword', fixedIssue.keyword);
            
            // 2. 고정된 URL로 이동
            window.location.href = fixedIssue.url; 
        });
    }

    // 2. 🟢 [수정] 실천 서약하기 로직 (이름 확인 및 메시지 표시)
    joinButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        
        if (name === "") {
            joinMessage.innerText = "⚠️ 서약을 위해 이름을 입력해주세요.";
            joinMessage.style.display = 'block';
            joinMessage.style.color = '#dc3545'; // 빨간색 경고
            setTimeout(() => { joinMessage.style.display = 'none'; }, 3000);
            return; // 이름이 없으면 여기서 종료
        }
        
        if (!joined) {
            joinMessage.innerText = `${name} 님! 서약해주셔서 감사합니다. 당신의 실천이 지구를 지키는 큰 힘이 됩니다.`;
            joinMessage.style.display = 'block';
            joinMessage.style.color = '#28a745';
            joinButton.innerText = '서약 완료 ✔️';
            joinButton.disabled = true;
            joined = true;
            
            // 전화번호는 저장 로직 없이 단순 입력만 받음.
            // 필요하다면 이곳에 서버로 데이터를 전송하는 로직을 추가해야 함.
            
        } else {
            joinMessage.innerText = `이미 서약에 참여하셨습니다. 지금 바로 실천을 시작하세요!`;
            joinMessage.style.color = '#007bff';
            joinMessage.style.display = 'block';
        }
        setTimeout(() => { if (joined) joinMessage.style.display = 'none'; }, 3000);
    });

    // ============================================================
    // 🗺️ 지도 및 검색 핵심 로직 (변화 없음)
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
        const keywords = ["쓰레기통", "분리수거", "공공 수거함"];
        let resultCount = 0;
        let searchCompleteCount = 0;

        keywords.forEach(keyword => {
            ps.keywordSearch(keyword, (data, status) => {
                searchCompleteCount++;

                if (status === kakao.maps.services.Status.OK) {
                    resultCount += data.length;
                    
                    for (let i = 0; i < data.length; i++) {
                        const place = data[i];
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
