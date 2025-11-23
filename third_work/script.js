document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM 요소 가져오기
    const joinButton = document.getElementById('join-campaign-btn');
    const joinMessage = document.getElementById('join-message');
    const findWasteBtn = document.getElementById('find-waste-btn'); // 현재 위치 버튼
    const searchRegionBtn = document.getElementById('search-region-btn'); // 지역 검색 버튼
    const searchInput = document.getElementById('search-input'); // 검색어 입력창
    const mapContainer = document.getElementById('map-container');
    const finderMessage = document.getElementById('finder-message');
    
    let joined = false;
    let map = null; // 지도 객체를 전역으로 관리
    let currentInfoWindow = null;   

    // 2. 실천 서약하기 로직 (기존과 동일)
    joinButton.addEventListener('click', () => {
        if (!joined) {
            joinMessage.innerText = "감사합니다! 당신의 실천이 지구를 지키는 큰 힘이 됩니다.";
            joinMessage.style.display = 'block';
            joinMessage.style.color = '#28a745';
            joinButton.innerText = '서약 완료 ✔️';
            joinButton.disabled = true;
            joined = true;
        } else {
            joinMessage.innerText = "이미 서약에 참여하셨습니다. 지금 바로 실천을 시작하세요!";
            joinMessage.style.color = '#007bff';
            joinMessage.style.display = 'block';
        }
        setTimeout(() => { if (joined) joinMessage.style.display = 'none'; }, 3000);
    });
    // [공통 함수] 지도 초기화 및 마커 표시 함수
    // centerLat, centerLon: 지도의 중심 좌표
    function searchNearbyBins(centerLat, centerLon, locationName = "지정 위치") {
        // API 로드 확인
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

        // 지도 생성 (이미 있으면 중심만 이동)
        const centerPosition = new kakao.maps.LatLng(centerLat, centerLon);
        if (!map) {
            const mapOption = { center: centerPosition, level: 4 };
            map = new kakao.maps.Map(mapContainer, mapOption);
        } else {
            map.setCenter(centerPosition);
        }

        // 중심 마커 표시 (현재 위치 or 검색된 지역 중심)
        new kakao.maps.Marker({
            map: map,
            position: centerPosition,
            title: locationName,
            image: new kakao.maps.MarkerImage(
                'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png', // 별 모양 마커 (중심)
                new kakao.maps.Size(24, 35)
            )
        });

        // 장소 검색 객체 생성
        const ps = new kakao.maps.services.Places(map);

        // 검색할 키워드 목록
        const keywords = ["쓰레기통", "분리수거", "공공 수거함"];
        let resultCount = 0;
        let searchCompleteCount = 0;

        // 키워드별 병렬 검색
keywords.forEach(keyword => {
    ps.keywordSearch(keyword, (data, status) => {
        searchCompleteCount++;

        if (status === kakao.maps.services.Status.OK) {
            resultCount += data.length;
            
            for (let i = 0; i < data.length; i++) {
                const place = data[i];
                
                // 1. 마커 생성
                const marker = new kakao.maps.Marker({
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x),
                    title: place.place_name
                });

                // 2. 정보창에 들어갈 HTML 내용 구성 (스타일 적용)
                // 주소가 있으면 도로명 주소, 없으면 지번 주소를 보여줍니다.
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

                // 3. 인포윈도우 객체 생성
                const infowindow = new kakao.maps.InfoWindow({
                    content: content,
                    removable: true // 닫기 버튼(X) 표시
                });

                // 4. 마커 클릭 이벤트 리스너 추가
                kakao.maps.event.addListener(marker, 'click', function() {
                    // 이미 열려있는 정보창이 있다면 닫기
                    if (currentInfoWindow) {
                        currentInfoWindow.close();
                    }
                    
                    // 현재 클릭한 마커의 정보창 열기
                    infowindow.open(map, marker);
                    
                    // 현재 열린 정보창을 변수에 저장 (나중에 닫기 위해)
                    currentInfoWindow = infowindow;
                });
            }
        }

                // 모든 키워드 검색이 끝났을 때 결과 메시지 처리
                if (searchCompleteCount === keywords.length) {
                    if (resultCount > 0) {
                        finderMessage.innerText = `✅ 검색 완료! 주변에서 ${resultCount}개의 관련 시설을 발견했습니다.`;
                        finderMessage.style.color = '#28a745';
                    } else {
                        finderMessage.innerText = `⚠️ '${locationName}' 주변 5km 반경 내에 등록된 수거 장소 데이터가 없습니다.`;
                        finderMessage.style.color = '#ffc107'; // 노란색 경고
                    }
                    
                    // 5초 후 메시지 숨김
                    setTimeout(() => { finderMessage.style.display = 'none'; }, 5000);
                }
            }, {
                location: centerPosition, // 중심 좌표 기준 검색
                radius: 5000 // 반경 5km
            });
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

        // 장소 검색 객체
        const ps = new kakao.maps.services.Places();

        // 입력된 키워드로 장소 검색 (좌표를 얻기 위함)
        ps.keywordSearch(keyword, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                // 검색 결과 중 첫 번째 장소를 중심으로 설정
                const target = data[0];
                const lat = target.y;
                const lon = target.x;
                
                // 해당 좌표로 이동 후 쓰레기통 검색 시작
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
});
