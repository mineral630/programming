제공해주신 'HTML DOM과 Document' 챕터(8장)의 내용을 바탕으로 상세하게 요약해 드립니다.

### 1. HTML DOM의 정의와 목적

HTML DOM(Document Object Model)은 브라우저가 웹 페이지의 HTML 태그마다 생성하는 객체(DOM 객체)를 다루는 모델입니다[cite: 43, 45]. [cite_start]DOM이 필요한 주된 이유는 자바스크립트를 사용해 **HTML 태그의 출력 모양이나 콘텐츠를 동적으로 제어**하기 위해서입니다[cite: 6, 47].

DOM 객체를 통해 다음과 같은 작업을 수행할 수 있습니다
* 각 HTML 태그의 CSS3 스타일 시트에 접근하고 변경할 수 있습니다
* HTML 태그가 출력한 텍스트나 이미지를 변경할 수 있습니다

### 2. DOM 트리 구조

브라우저는 HTML 문서를 읽어들일 때, 태그들의 포함 관계(부모-자식 관계)에 따라 DOM 객체들로 구성된 **트리(tree) 구조**를 생성합니다

* 루트(Root):** DOM 트리의 가장 최상위 루트는 `document` 객체입니다
* 노드(Node):** 트리의 각 노드는 DOM 객체이며 , HTML 태그 당 하나씩 생성됩니다
* **렌더링 과정:** 브라우저는 DOM 트리가 완성되면, 이 트리를 기반으로 HTML 태그(DOM 객체)를 화면에 그립니다
* 만약 자바스크립트에 의해 DOM 객체가 변경되면, 브라우저는 해당 HTML 태그의 출력 모양을 즉시 갱신합니다

### 3. DOM 객체의 구성 요소

HTML 태그는 태그 이름, 속성(attribute), CSS3 스타일, 이벤트 리스너, 콘텐츠(innerHTML)로 구성됩니다

DOM 객체는 이러한 HTML 태그의 요소들을 반영하여 5가지 주요 구성 요소를 가집니다
1.  **프로퍼티 (Property):** HTML 태그의 속성을 반영합니다
    * 예: `<p id="firstP">` 태그의 `id` 속성은 DOM 객체의 `id` 프로퍼티("firstP")가 됩니다`innerHTML`, `tagName`  등도 주요 프로퍼티입니다.
2.  **메소드 (Method):** HTML 태그를 제어하는 기능을 하는 DOM 객체의 멤버 함수입니다
    * 예: `setAttribute()`, `focus()` 등
3.  **컬렉션 (Collection):** 자식 DOM 객체들의 목록처럼 배열과 비슷한 집합적 정보입니다
    * 예: `children` (자식 객체 목록)
4.  **이벤트 리스너 (Event Listener):** HTML 태그에 작성된 이벤트 리스너를 반영합니다
    * 예: `onclick`, `onkeydown` 등
5.  **CSS3 스타일:** 태그에 설정된 CSS3 스타일 정보를 반영하며, DOM 객체의 `style` 프로퍼티를 통해 접근하고 제어할 수 있습니다

### 4. DOM 객체 접근 및 제어

자바스크립트로 DOM을 제어하기 위해 먼저 원하는 DOM 객체를 찾아야 합니다.

* **`document.getElementById(id)`:** `id` 속성을 이용해 특정 DOM 객체 하나를 찾는 가장 일반적인 방법입니다
* **`document.getElementsByTagName(name)`:** 태그 이름을 기준으로 해당하는 모든 DOM 객체를 컬렉션(배열과 유사)으로 찾아 반환합니다
* **`document.getElementsByClassName(name)`:** `class` 속성값이 같은 모든 DOM 객체를 컬렉션으로 찾아 반환합니다

객체를 찾은 후에는 프로퍼티를 변경하여 HTML을 제어합니다.

* **스타일 변경:** `객체.style.프로퍼티명`을 사용합니다
    * 이때 CSS 속성명이 `background-color`처럼 하이픈(-)을 포함하면, 자바스크립트에서는 `backgroundColor`처럼 카멜 케이스(camelCase) 표기법을 사용해야 합니다
* **콘텐츠 변경:** `객체.innerHTML` 프로퍼티는 태그의 시작과 끝 태그 사이의 HTML 콘텐츠를 의미합니다
* 이 값을 변경하면 화면에 보이는 내용이 즉시 바뀝니다
* **`this` 키워드:** DOM 객체의 이벤트 리스너(예: `onclick`) 내에서 `this` 키워드를 사용하면, 이벤트가 발생한 DOM 객체 자신을 가리킵니다

### 5. document 객체

`document` 객체는 HTML 문서 전체를 대변하는 객체이자, DOM 트리의 최상위 객체(루트)입니다
브라우저는 HTML 문서를 로드하기 전에 `document` 객체를 먼저 생성합니다

* `document` 객체는 `style` 프로퍼티가 없는 등, 일반적인 HTML 태그의 DOM 객체와는 구별됩니다
* `location` (현재 URL 정보), `title` (문서 제목), `readyState` (로딩 상태), `activeElement` (현재 포커스를 가진 요소) 등 문서 전반에 대한 프로퍼티를 가집니다.

**`document.write()` 메소드:**
`document.write()`는 **HTML 페이지가 로드되는 과정**에서 document 객체에 HTML 콘텐츠를 추가하는 메소드입니다
`writeln()`은 출력 끝에 줄바꿈 문자(\n)를 추가하지만, 실제 화면에서는 공백 한 칸 정도로만 보일 뿐 줄바꿈이 되지는 않습니다

> **[중요] `write()` 사용 시 주의사항:**
> `document.write()`를 HTML 문서 로딩이 **완료된 후** (예: 버튼 클릭 이벤트 등) 호출하면, 브라우저는 현재 문서를 모두 지우고 `write()`로 전달된 내용으로 새 문서를 엽니다.

**`document.open()` / `close()`:**
`document.open()`은 현재 브라우저의 HTML 콘텐츠를 지우고 새 페이지를 시작하며, `document.close()`는 `write()`로 콘텐츠 작성을 완료했음을 알립니다.
이는 주로 `window.open()`으로 연 새 창에 동적으로 HTML을 작성할 때 사용됩니다

### 6. 문서의 동적 구성 (DOM 객체 추가/삭제)

문서 로딩이 완료된 후에도 DOM 객체를 동적으로 생성, 삽입, 삭제할 수 있습니다.

1.  **생성:** `document.createElement("태그이름")` 메소드를 호출하여 메모리에 새로운 DOM 객체를 생성합니다
2.  **수정:** 생성된 객체의 `innerHTML`이나 `style` 등을 설정합니다
3.  **삽입:** `부모객체.appendChild(생성한자식객체)` 메소드를 사용하여 생성한 객체를 DOM 트리의 자식으로 추가합니다
4.  **삭제:** `부모객체.removeChild(삭제할자식객체)` 메소드를 사용하여 DOM 트리에서 특정 자식 객체를 제거합니다
