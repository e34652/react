<details>
  <summary><strong>1. Modal, Portal</strong></summary>

### 📌 포탈(Portal)

- 렌더링될 코드를 **다른 DOM 위치로 옮겨주는 기술**
- `ReactDOM.createPortal`을 활용

### 📌 모달과 포탈의 관계

- 모달은 포탈 없이도 구현 가능하지만, 이 경우 **컴포넌트의 하위 요소**로 렌더링됨
- 시각적으로 **페이지 최상단 레이어**에 위치하는 모달이  
  다른 요소의 하위에 존재하는 것은 **논리적으로 맞지 않음**
- 포탈을 사용하면 모달을 최상단에 위치시켜 이러한 점을 해소 가능

### 💡 포탈을 사용하는 이유

1. **스타일 안정성 & 컨텍스트 분리**
   - DOM 계층을 분리해 다른 컴포넌트로부터 독립
   - 스타일 및 이벤트 간섭 최소화
2. **접근성 & 포커스 관리**
   - 전역 위치에서 포커스 트랩 / 스크린리더 흐름(`aria-modal`, `role="dialog"`)을 일관되게 적용
   - 배경 스크롤 잠금, ESC 닫기, 배경 클릭 등 전역 이벤트 관리에 용이
3. **일관된 z-index 정책**
   - 레이어 우선순위를 예측 가능하게 유지
4. **테스트 & 유지보수 용이성**
   - 구조적으로 페이지 최상단에 고정 → 동작이 단순해짐

</details>

<details>  <summary><strong>2. useRef</strong></summary>
<details> <summary><strong>0) 요약</strong></summary>

useState: 값이 바뀌면 렌더링이 필요한 UI 상태에 사용.

useRef: 값이 바뀌어도 렌더링이 불필요한 내부 값/DOM 노드/외부 인스턴스에 사용. 포커스·스크롤·측정에 적합.

forwardRef: 부모가 준 ref를 자식의 실제 DOM으로 전달.

useImperativeHandle: 부모에 선택적 메서드만 노출(캡슐화)해 내부 DOM 의존 줄이기.

</details>
<details> <summary><strong>1) useState vs useRef — 언제 무엇을 쓰나</strong></summary>

useState

O:  
변경 시 UI에 즉시 반영되어야 하는 값
예) 입력값, 토글 상태, 로딩 여부

X:  
UI에 영향이 없는 시스템 값을 useState로 관리하면 불필요한 렌더링 발생

useRef

O:  
UI로 직접 표시하지 않는 값, 렌더링과 무관한 내부 값  
예) 타이머/인터벌 ID, 외부 라이브러리 인스턴스, 직전 값 보관, DOM 노드 참조

X:  
렌더링에 영향을 주는 값, UI에 표시되는 값  
예) 입력값, 토글 상태, 로딩 여부

useRef 변경은 렌더링을 유발하지 않음 → 화면 업데이트가 필요한 값은 useState로

</details>
<details> <summary><strong>2) useRef 기본 개념과 핵심 규칙</strong></summary>
const ref = useRef(initialValue); // = { current: initialValue }

ref.current를 읽고 쓸 수 있지만 렌더링은 유발하지 않음.

사용처: 포커스/스크롤/측정, 타이머 보관, 외부 인스턴스(D3/Chart.js 등) 저장.

React가 관리하는 DOM을 파괴적으로 조작하지 말기(충돌 위험). 불가피하면 비파괴적 조작만.

파괴적 조작:  
React가 “그려야 한다고 알고 있는” DOM 트리/속성을 직접 바꿔서  
다음 렌더에서 덮어쓰이거나 불일치를 일으킬 가능성이 있는 조작.

비파괴적 조작:  
DOM 구조나 React가 관리하는 속성은 건드리지 않고,  
읽기/포커스/스크롤/측정/브라우저 고유 API 같은 부수효과성 작업만 하는 조작.

왜?

React는 가상 DOM을 단일 진실로 삼아 다음 렌더 때 실제 DOM을 그 상태로 동기화함.  
React가 관리하는 부분을 조작하면 예상 못한 불일치가 날 수 있음.
이러한 부분이 바로 React가 선언적 언어라는 특징임.

</details>
<details> <summary><strong>3) DOM과 ref의 타이밍 — 언제 값이 설정되나</strong></summary>

<details><summary>렌더 단계 (render phase)</summary>

\
정의:  
컴포넌트 함수를 호출해서 다음 UI 스냅샷을 계산하는 단계.

작업:  
훅 실행(useState, useMemo, useRef 등), JSX 반환,  
diff(어떤 DOM 변경이 필요한지 목록 작성) 등.

이때는 DOM을 조작하지 않고 무엇을 그릴지 계산만 함.

Concurrent 모델의 렌더링으로 인한 우선순위로 인해  
작업이 중단·재개·취소될 수 있음.

<details>
<summary>Concurrent 모델이란</summary>

React 18부터의 렌더링 모델로, 렌더 단계를 필요에 따라 중단·재개·취소하여,  
급한 작업 (클릭/타이핑/스크롤) 발생시 렌더를 멈추고 우선 처리 후  
렌더를 재개하는 방식으로 체감 성능을 높일 수 있음.

병렬(멀티스레드)로 동시에 진행하는 게 아닌,  
한 스레드에서 우선순위를 바꿔가며 협력적으로 스케줄링하는 방식.

왜?

기존(동기) 렌더링은 한 번 시작하면 끝날 때까지 메인 스레드를 붙잡음 → 입력 지연, 끊김

렌더 단계는 이제 interruptible(중단 가능)하지만  
커밋 단계는 여전히 원자적(atomic)임.

(한 번 커밋되면 화면이 그 상태로 일관되게 바뀜.)

</details>

\
따라서 렌더 단계에서는 아직 실제 DOM 노드가 존재하지 않거나 확정되지 않을 수 있음.

</details>

<details><summary>커밋 단계 (commit phase)</summary>

\
정의:  
렌더 단계에서 만든 변경 목록(이펙트 리스트)을 진짜 DOM에 적용하는 단계.

작업 순서:  
Before-mutation:  
일부 오래된 라이프사이클 준비(getSnapshotBeforeUpdate 등)

Mutation:  
DOM 추가/삭제/속성 업데이트, 필요 시 기존 ref 분리(detach)

Layout:  
새 ref 연결(attach) → useLayoutEffect / 클래스 componentDidMount/Update 실행

Paint:  
브라우저가 화면을 그리는 단계

Passive Effects:  
useEffect 실행

<details><summary>비차단 작업이란?</summary>
비차단 작업(Non-blocking work)이란?

브라우저가 DOM 패치 → 레이아웃 계산 → 페인트를 끝내고 화면을 보여준 뒤에 실행되어도 되는, 렌더·레이아웃에 즉시 영향이 없는 작업.
일반적으로 useEffect에서 하는 작업들이 해당함. (페인트 후 실행)

예시 — 비차단(→ useEffect)

네트워크 요청 시작/취소(Fetch, WebSocket 구독 설치·해제)

이벤트 리스너 등록/해제(window.addEventListener 등)

로깅/분석, 성능 측정, Sentry 보고

타이머/인터벌 설정·해제

비동기 데이터로 비중요 상태 갱신(갱신 후 UI가 깜빡임 없이 업데이트 됨)

브라우저 API 중 화면 배치에 영향이 없는 것들(navigator 접근 등)

반대로 “차단”될 수 있는 작업(→ useLayoutEffect 권장)

페인트 이전에 끝나야 깜빡임/점프가 없는 일들:

DOM 측정 후 바로 스타일/클래스 변경(레이아웃에 영향)
예: getBoundingClientRect() → 위치 계산 → 클래스 적용

즉시 포커스/스크롤 위치 조정(focus(), scrollIntoView())

레이아웃에 영향을 주는 동기 계산/동기 스타일 변경

</details>
</details>

ref.current는 커밋 단계에서 설정/해제됨.

첫 렌더 중에는 DOM이 없어 ref.current === null.

렌더 중 ref를 읽거나 쓰지 말기. 이벤트 핸들러나 effect에서 다루기.

</details>

<details> <summary><strong>4) flushSync — “지금 바로 DOM이 최신이어야 할 때”</strong></summary>

일반적으로 setState는 비동기 배치로 처리되어 직후 DOM이 구 상태일 수 있음.
flushSync로 특정 업데이트를 동기 적용하면 이후 코드는 최신 DOM을 보게 됨.

import { flushSync } from 'react-dom';

function handleAdd() {
const newTodo = { id: Date.now(), text };
flushSync(() => {
setTodos(prev => [...prev, newTodo]);
setText('');
});
listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
}

장점: 직후 DOM 의존 코드(스크롤/측정)가 안전하게 동작

주의: 과도 사용 시 배치 최적화 손실 → 꼭 필요한 곳에서만

</details>
<details> <summary><strong>5) 원칙 — ref는 “탈출구”</strong></summary>

렌더 트리 밖 작업(포커스, 스크롤, 측정, 브라우저/외부 API)에 ref 사용

렌더 중 ref.current를 읽거나 쓰지 않기 → 필요한 정보는 state로 표현

React가 업데이트할 가능성이 없는 안전한 영역만 제한적으로 조작

</details>
<details> <summary><strong>6) forwardRef — 부모의 ref를 자식 DOM으로 전달</strong></summary>

함수형 컴포넌트는 ref를 일반 props처럼 받지 못함.
부모가 <Child ref={...} />로 준 ref를 자식의 특정 DOM에 연결하려면 **forwardRef**가 필요.

언제?

외부 라이브러리가 자식의 실제 DOM에 포커스/위치 계산 등을 요구할 때

부모가 자식의 최상위 DOM에 접근해야 할 때

</details>
<details> <summary><strong>7) useImperativeHandle — 노출 API를 “제한해서” 캡슐화</strong></summary>

부모가 ref로 DOM 전체에 접근하면 자식 내부 구조에 과도 의존 → 변경에 취약.
useImperativeHandle로 필요한 동작만 노출해 결합도 낮추기.

효과

캡슐화: 부모는 내부 DOM 구조를 몰라도 됨

의존성 감소: 공개 API만 사용 → 유지보수성↑, 협업 안정성↑

</details>
<details> <summary><strong>8) Refs & DOM — 기본 동작 정리</strong></summary>

JSX에서 <div ref={myRef}>를 달면 커밋 단계에 myRef.current = 해당 DOM

엘리먼트가 언마운트/변경되면 myRef.current = null

React는 DOM 직접 조작 API를 제공하지 않음 → ref로 DOM을 얻어 브라우저 API 사용

</details>
<details> <summary><strong>9) 언제 ref를 쓰면 좋은가 </strong></summary>

타이머/인터벌/타임아웃 ID 저장·취소

DOM 접근/조작(포커스, 스크롤, 측정)

외부 라이브러리 인스턴스/핸들(Chart.js, Canvas, D3)

렌더 계산에 필요 없는 값(로그/카운터/직전 값 등)

레거시(jQuery/Vanilla) 코드와의 연동

</details>
</details>
