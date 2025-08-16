## React 학습 노트

<details><summary><strong>a. Component Life Cycle</strong></summary>

<details><summary>1. 라이프 사이클</summary>

## 정의

컴포넌트가 마운트 → 업데이트 → 언마운트로 지나가는 개념적 시간 흐름.  
이 흐름의 특정 지점에 무엇을 할 수 있는지를 규정함.

## 단계

- 렌더 단계:  
  UI 계산(부수효과 금지 = 순수성)

- 커밋 단계:  
  DOM 반영, ref 연결, 이펙트 실행  
  (Before-mutation → Mutation → Layout)

- 브라우저 페인트 후:  
패시브 이펙트(useEffect) 비동기 실행
</details>

<details><summary>2. 컴포넌트</summary>

## 클래스 컴포넌트

Hook이 나오기 전(16.8 이전) 활용되던 컴포넌트.  
ES6 class로 컴포넌트를 만들고, Method를 통해 시점을 표현.

현재 표준은 함수 컴포넌트 + Hooks이지만 동작은 여전히 지원됨.  
하지만 에러 바운더리 등 몇몇 기능은 여전히 클래스 방식이 표준임.

### 특징:

- 인스턴스(this)가 존재함
- 상태 업데이트가 부분 병합으로 진행됨
- createRef로 refs 사용

## 함수 컴포넌트

함수가 props를 받아 JSX를 반환하는 형태로 활용됨.  
Hook으로 상태/이펙트/구독 등을 선언해 시점을 표현

### 특징:

- 인스턴스(this)가 없고 Hook(useState 등)으로 상태를 관리함.
- 상태 업데이트는 교체(replace)가 기본(객체 병합은 직접 수행).
- Server Components는 함수 컴포넌트만 지원함(Hook 사용 불가).
</details>
<details><summary>3. 클래스 컴포넌트 ↔ 함수 컴포넌트</summary>

## 컴포넌트별 라이프 사이클

### 마운트 직후(커밋 Layout 단계, 페인트 전 동기 실행)

- 클래스: componentDidMount
- 함수: useLayoutEffect(() => { ... }, [])

### 마운트/업데이트 후(페인트 후)

- 클래스: 클래스는 페인트 후 전용 메서드 없음
- 함수: useEffect 실행

### 업데이트 직전 스냅샷(커밋 Before-mutation)

- 클래스: getSnapshotBeforeUpdate
- 함수: useLayoutEffect의 cleanup에서 스냅샷 캡처(+ ref) 패턴

### 업데이트 후(커밋 Layout, 페인트 전 동기)

- 클래스: componentDidUpdate
- 함수: useLayoutEffect(() => { ... }, [deps])

### 언마운트/업데이트 정리

- 클래스: componentWillUnmount
- 함수: useEffect의 Clean Up  
  (레이아웃 단계 정리는 useLayoutEffect의 Clean Up - Before-mutaition에 실행됨)

### 렌더 스킵 최적화

- 클래스: shouldComponentUpdate
- 함수: React.memo(주) + useMemo/useCallback(보조)

</details>

 </details>

##

<details><summary><strong>b. Reconciliation</strong></summary>
<details><summary>렌더 단계 (render phase)</summary>

## 정의

컴포넌트 함수를 호출해서 다음 UI 스냅샷을 계산하는 단계.

## 작업

훅 실행(useState, useMemo, useRef 등), JSX 생성,  
이전 트리와 비교해 fiber 플래그/이펙트 리스트 준비(무엇을 바꿀지 표기).

## 특징

- DOM을 **조작하지 않고**, 무엇을 그릴지 **순수하게** 계산만 함.
- Concurrent 모델에서는 우선순위에 따라 **중단·재개·취소**될 수 있음.  
  → 이 시점의 DOM은 **확정되지 않았을 수 있음**.

</details>
<details>
<summary>Concurrent 모델이란</summary>

## 정의

React 18부터의 렌더링 모델로, 렌더 단계를 우선순위에 따라 중단·재개·취소하여,  
급한 작업 (클릭,타이핑,스크롤)을 우선적으로 처리 후
렌더를 재개하는 방식  
→체감 성능을 높일 수 있음.

병렬(멀티스레드)로 동시에 실행하는 게 아닌,  
한 스레드에서 우선순위를 바꿔가는 협력적 스케줄링 방식.

## 왜?

기존(동기) 렌더링은 한 번 시작하면 끝날 때까지 메인 스레드를 점유  
→ 입력 지연, 끊김

## 업데이트 우선순위

모든 업데이트를 비동기로 만드는 것이 아님.  
긴급(urgent) 업데이트는 여전히 즉시(동기) 커밋될 수 있고,  
startTransition으로 감싼 전환(transition) 업데이트는 중단·재개·취소 가능한 낮은 우선순위로 처리됨.

## Concurrent모델에서는

커밋 단계는 여전히 원자적(atomic)이지만  
(한 번 커밋되면 화면이 그 상태로 일관되게 바뀜.)

렌더 단계는 중단 가능(interruptible)함.

따라서 렌더 단계에서는 아직 실제 DOM 노드가 존재하지 않거나 확정되지 않을 수 있음  
→ 렌더 중엔 DOM ref가 아직 없을 수 있고, 소유권/시점/조건에 따라 null이 될 수 있다.

## 커밋 단계의 원자성

커밋의 원자성은 '루트(root)' 단위임.  
여러 루트(예: 별도 포털) 사용 시 각 루트가 독립적으로 커밋될 수 있음.

</details>
<details><summary>커밋 단계 (commit phase)</summary>

## 정의

렌더 단계에서 준비된 변경을 실제 DOM에 반영하고  
관련 이펙트를 실행하는 단계.

## 작업 흐름

### Before-Mutation:

DOM 변경 직전에 필요한 읽기/주입 작업을 처리.  
(이전 커밋의) useLayoutEffect cleanup 실행 → getSnapshotBeforeUpdate, useInsertionEffect

- getSnapshotBeforeUpdate:  
  변경 직전 마지막 DOM 상태를 캡처해서, 변경 후 활용하는 스냅샷 전달 메커니즘.  
  (예: 스크롤 위치 복원 등)

- useInsertionEffect (react18 이후 추가):  
  CSS-in-JS가 스타일을 삽입하는 매우 한정된 용도를 위한 훅.  
  DOM 변경 전에 동기적으로 실행되며, DOM을 읽거나 변경하면 안됨.

### Mutation:

- DOM 변경(추가/삭제/속성 업데이트)
- 기존 ref 분리(detach)

### Layout:

- 새 ref 연결(attach) → useLayoutEffect, componentDidMount/Update 실행

### Paint:

- 브라우저가 화면을 그리는 단계
- 페인트 이전에 동기 스타일 / 측정 / 포커스 조정을 끝내야 페인트 시 깜빡임/점프를 방지 가능.
- 무거운 작업을 useLayoutEffect에 넣으면 페인트가 지연될 수 있음.  
  → useEffect로 미루거나 비용을 줄여야함.

### Passive Effects:

- (이전 커밋의) useEffect cleanup → 이번 커밋의 useEffect 실행

## useLayoutEffect + ref 패턴

### 스냅샷 읽기(“변경 직전”):

이전 커밋의 useLayoutEffect 클린업 안에서 DOM 측정/상태 캡처  
→ ref에 저장
(Before-mutation이므로 변경 전 DOM에 접근 가능.)

### 스냅샷 적용(“변경 직후”):

이번 커밋의 useLayoutEffect 에서 ref에 저장해둔 스냅샷을 사용해 동기 보정  
(스크롤 복원, 포커스/크기 조정 등).

</details>
<details><summary>비차단 작업이란?</summary>

## 정의

브라우저가 DOM 패치 → 레이아웃 계산 → 페인트를 끝내고  
화면을 보여준 뒤에 실행되어도 되는, 렌더·레이아웃에 즉시 영향이 없는 작업.  
일반적으로 useEffect에서 하는 작업들이 해당함. (페인트 후 실행)

## 예시

- 네트워크 요청 시작/취소(Fetch, WebSocket 구독 설치·해제)
- 이벤트 리스너 등록/해제(window.addEventListener 등)
- 로깅/분석, 성능 측정, Sentry 보고
- 타이머/인터벌 설정·해제
- 비동기 데이터로 비중요 상태 갱신(갱신 후 UI가 깜빡임 없이 업데이트 됨)

- 브라우저 API 중 화면 배치에 영향이 없는 것들(navigator 접근 등)

## 반대로 '차단'될 수 있는 작업(→ useLayoutEffect 권장)

페인트 이전에 끝나야 깜빡임/점프가 없는 작업들

- DOM 측정 후 바로 스타일/클래스 변경(레이아웃에 영향)  
  예: getBoundingClientRect() → 위치 계산 → 클래스 적용

- 즉시 포커스/스크롤 위치 조정(focus(), scrollIntoView())

- 레이아웃에 영향을 주는 동기 계산/동기 스타일 변경

</details>
</details>
</details>

##

<details><summary><strong>c. Mount, Unmount</strong></summary>

<details><summary>1. Mount</summary>

## 정의

첫 커밋에서 컴포넌트가 트리에 배치되고, DOM이 생성/연결되며,  
state와 refs가 초기화될 때(React 관점의 “처음 등장”)

## 예시

- 조건부 렌더에서 show=false → true가 되어 노드가 새로 생길 때  
  (또는 JSX에서 제외→포함될 때만 마운트)
- 키(key) 변경으로 이전 노드가 교체될 때  
  (key가 바뀌면 상태/이펙트가 파기되고 완전한 언마운트→마운트가 일어남)

- 라우트/분기 전환 등으로 새 노드가 생성될 때  
  (중첩 라우팅에선 변경된 경로의 서브트리만 마운트될 수 있음)

## 마운트 직후

커밋의 Layout 단계가 실행됨  
ref 연결 → useLayoutEffect / componentDidMount 동기 실행 (페인트 전)  
→ 브라우저 페인트 → useEffect 비동기 실행

</details>

<details><summary>2. Unmount</summary>

## 정의

커밋의 Mutation 단계에서 DOM/refs가 분리·제거되고, 이어서 상태/이펙트가 파기될 때

## 예시

- 조건부 렌더에서 show=true → false로 노드가 사라질 때

- 리스트 재조합/키 변경으로 노드가 교체될 때

- 부모가 내려가면서 하위가 함께 제거될 때  
  (부모가 언마운트되면 자식 서브트리도 함께 언마운트됨)

- 라우팅/분기 전환 등으로 해당 서브트리가 없어질 때

## 언마운트 직전

(커밋 중, 페인트 전) useLayoutEffect cleanup 실행  
→ DOM이 제거되기 직전에 동기 정리 기회  
(Mutation 이후에도 해당 노드의 DOM/refs가 존재할 경우)

## 언마운트 직후

(보통 페인트 이후) useEffect cleanup 실행  
→ 구독/타이머/리스너 정리 등

페인트 이후 비동기로 실행되므로  
레이아웃 측정/동기 DOM 접근에는 부적합

## Clean Up

LayoutEffect: 페인트 전(동기)  
useEffect: 페인트 후(비동기)

</details>

<details><summary>3. 참고</summary>

\* 숨김은 언마운트가 아니며 언마운트 후 setState는 무시됨  
(비동기 작업·구독은 cleanup에서 반드시 취소/해제)

\* ref는 Mutation 단계에서 먼저 null로 분리되므로  
이후 Layout 단계의 cleanup/콜백에서의 ref.current를 신뢰하지 말 것
\*StrictMode에서 초기 마운트 직후 즉시 언마운트→재마운트 시뮬레이션 가능(부작용 탐지용).

\* 서버에선 브라우저 DOM이 없어 마운트/이펙트가 실행되지 않음.  
(하이드레이션 시 마운트 시점에 이펙트가 실행됨)

</details>
</details>

##

<details><summary> 하이드레이션(hydration)</summary>

## 정의

서버가 미리 그려 보낸 정적 HTML를 클라이언트에서 JS를 통해 인터랙티브하게 만드는 과정.

React가 HTML에 이미 있는 DOM을 재사용하여 React 앱을 연결(attach) 하는 것.  
(이벤트 리스너 등록, refs 연결, 마운트 시점에 이펙트 실행)

## 흐름

서버:

- renderToString / 스트리밍 SSR로 HTML 전송

브라우저:

- HTML 먼저 페인트(사용자에게 바로 보임) → JS 번들 로드 → hydrateRoot 호출

React:

- 기존 DOM과 가상 트리를 매칭 → 이벤트/refs 연결 → 이펙트 실행
- 시점  
  useLayoutEffect: 커밋 직후 동기 실행(페인트 전)  
  useEffect: 페인트 후 비동기 실행

→ 사용자 입장에선 화면이 “먼저 보이고”, 곧이어 상호작용이 가능해짐

## SSR 하이드레이션 시점별 타임라인

하이드레이션도 일반 커밋과 동일한 서브-단계로 Reconciliation이 진행됨.

비교 기준이 “이전 클라이언트 트리”가 아니라 “서버가 만들어 둔 실제 DOM(SSR 마크업)”라는 점이 다름

### (SSR) 초기 표시

서버가 만든 HTML이 먼저 그려져 이미 화면에 보이는 상태입니다.
(아직 React 이벤트/효과/refs는 붙지 않았음)

### 클라이언트 렌더 단계 (render phase)

기존 DOM을 재사용하면서 다음 UI 스냅샷을 계산.

DOM 조작 없음(측정/변경 X), 이펙트 실행도 아님.

### 커밋 단계 (commit phase)

- Before-mutation:  
  하이드레이션은 “마운트”이므로  
  이전 커밋의 layout-effect clean up이나 getSnapshotBeforeUpdate는 없음  
  useInsertionEffect(있다면)만 동기적으로 실행되어  
  스타일 삽입 등을 처리합니다. (DOM 읽기/변경 금지)

- Mutation:
  이상적으론 DOM 변경 없음.  
   불일치가 있으면 최소한의 삽입/갱신/삭제로 수리가 이뤄질 수 있음.  
  (첫 마운트라 이전 ref는 없으므로 detach 대상도 보통 없음)

- Layout:  
  여기서 ref가 attach되어 ref.current가 유효해짐.  
  곧바로 (이번 커밋의) useLayoutEffect 본문이 동기 실행됨.  
  → 이 시점에 DOM 측정, 동기 포커스/스크롤/스타일 보정을 안전하게 수행.  
  (클래스 컴포넌트라면 componentDidMount도 이때 실행됨.)

- Paint:  
  브라우저가 변경분을 그립니다.  
  (SSR로 이미 그려진 상태라면, 차이난 부분만 다시 페인트)

- Passive effects:  
  페인트 후 비동기로 (이번 커밋의) useEffect 실행.  
  로깅/구독/네트워크 등 비차단 작업을 이때 처리.

### 한 줄 요약

ref.attach → useLayoutEffect → (페인트) → useEffect

하이드레이션에서도 순서는 동일하며,  
ref를 신뢰할 수 있는 최초 시점은 Layout 단계임.

### 참고/주의

- 개발 모드 Strict Mode에선 마운트 이펙트(레이아웃/패시브)가 즉시 unmount→remount 되어  
   2번 호출되는 것처럼 보이는 검증 동작이 있음.

- 루트/하이드레이션 경계(boundary)가 여러 개면  
  각 경계 단위로 원자적 커밋이 일어나 독립적으로 위 순서를 밟습니다.

## 하이드레이션의 렌더 단계 = 리컨실리에이션

하이드레이션도 “렌더(=리컨실리에이션) → 커밋”의 동일한 큰 흐름을 따르며,
**리컨실리에이션의 비교 상대가 ‘서버 DOM’**이라는 점만 다릅니다.

클라이언트에서 React가 요소 트리를 만들며 서버 DOM을 한 노드씩 매칭하려고 시도합니다.

이때는 “이전 Fiber 트리와 비교”가 아니라 **“현재 서버 DOM과 일치 여부 확인”**을 하죠.
일치하면 재사용 표시, 다르면 그 지점부터 클라이언트 재생성(fallback) 경로로 전환될 수 있어요.

### 커밋 단계

가능한 한 서버 DOM을 재사용하고, 필요한 최소한만 수정합니다(속성 보정, 누락된 노드 삽입 등).

이어서 ref attach → useLayoutEffect(동기) → (페인트) → useEffect(비동기) 순으로 실행됩니다.

### 불일치(mismatch) 처리

- 경미한 불일치(속성 차이 등):  
  커밋에서 보정.

- 중대한 불일치(노드 구조가 크게 다름):  
  해당 서브트리는 버리고 새로 렌더합니다(클라이언트 렌더로 강등).

### Concurrent + SSR

React 18에선 선택적/점진적 하이드레이션(Suspense 경계 등)로 우선순위에 따라 부분적으로 리컨실리에이션을 진행하고 필요 시 중단·재개도 가능합니다.

## 하이드레이션이 아닌 경우

- CSR 초기 마운트:  
  HTML 없이 JS가 DOM을 처음부터 생성

- 리렌더:  
  이미 하이드레이션이 끝난 뒤의 일반적인 상태 업데이트

- 단순 표시/숨김:  
  DOM을 유지한 채 CSS로 숨기는 건 하이드레이션과 무관

## 불일치(mismatch) 처리

서버 HTML과 클라이언트 렌더 결과가 다를 경우  
React가 경고를 띄우고, 그 서브트리만 폐기·재생성할 수 있음  
(이 경우 해당 부분은 DOM을 새로 만듦).

## 불일치를 유발하는 원인

- 랜덤/시간 의존 값(예: Date.now()), locale 차이

- 서버/클라이언트에서 다른 데이터 소스

- ID/키 불일치

- 의도적 차이는 suppressHydrationWarning 등으로 최소화

## 장점

초기 콘텐츠가 빨리 보임(SEO/퍼포먼스), TTFB/FP 개선

## 단점

JS 번들 다운로드·실행 + 하이드레이션 비용이 추가(복잡한 페이지일수록 큼)

</details>

##

<details><summary><strong>d. Portal, Modal</strong></summary>

## 포탈(Portal)

- 렌더링될 코드를 **다른 DOM 위치로 옮겨주는 기술**
- `ReactDOM.createPortal`을 활용

## 모달과 포탈의 관계

- 모달은 포탈 없이도 구현 가능하지만, 이 경우 **컴포넌트의 하위 요소**로 렌더링됨
- 시각적으로 **페이지 최상단 레이어**에 위치하는 모달이  
  다른 요소의 하위에 존재하는 것은 **논리적으로 맞지 않음**
- 포탈을 사용하면 모달을 최상단에 위치시켜 이러한 점을 해소 가능

## 포탈을 사용하는 이유

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

##

<details><summary><strong>e. useRef</strong></summary>

<details><summary> 요약 </summary>

### useState:

값이 바뀌면 렌더링이 필요한 UI 상태에 사용.

### useRef:

값이 바뀌어도 렌더링이 불필요한 내부 값/DOM 노드/외부 인스턴스에 사용.  
→ 포커스·스크롤·측정에 적합.

### forwardRef:

부모가 준 ref를 자식의 실제 DOM으로 전달.(리액트 19 이전)

### useImperativeHandle:

부모에 선택적 메서드만 노출(캡슐화)해 내부 DOM 의존을 줄임.

</details>

## 정의

컴포넌트가 리렌더링되어도 유지되지만  
값이 변경되어도 렌더링을 유발하지 않는 참조를 만들어주는 Hook.

## 특징

- 지속성:  
  렌더 사이에 값이 유지됨 (컴포넌트의 메모리 역할).

- 비반응성:  
  ref.current 변경은 리렌더를 유발하지 않음.

- 안정적 식별자:  
  같은 컴포넌트 생애 동안 ref 객체 자체는 변하지 않음.

- DOM 연결:  
  JSX에서 ref 속성에 넣으면 커밋 단계에 DOM 노드가 연결 또는 해제됨

- 인스턴스 필드의 대체품:  
  클래스의 인스턴스 필드 같은 용도에 대응.

## 기본 동작

- JSX에서 DOM 속성으로 'ref={myRef}'를 달면  
  커밋 단계에 'myRef.current = 해당 DOM'이 됨

- DOM이 언마운트 또는 변경되면 myRef.current = null

- React는 DOM 직접 조작 API를 제공하지 않음 → ref로 DOM을 얻어 브라우저 API 사용

## 설정 시점

ref.current는 커밋 단계에서 설정/해제됨.

- Mutation 단계: 이전 ref 분리(null 세팅)
- Layout 단계: 새 DOM에 ref 최종 연결, 이어서 useLayoutEffect 실행

첫 렌더 중에는 DOM이 없으므로 ref.current === null.

## 사용 시점

Layout 단계에서 ref가 Attach된 직후 ref.current를 신뢰할 수 있음.  
따라서 useLayoutEffect 및 componentDidMount/Update부터 안전하게 사용 가능.

(렌더 단계의 ref는 이전 커밋 기준 값일 수 있음.)

## 사용처

- 타이머/인터벌/타임아웃 ID 저장·취소

- DOM 접근/조작(포커스, 스크롤, 측정)

- 외부 라이브러리 인스턴스/핸들(Chart.js, Canvas, D3)

- 렌더 계산에 필요 없는 값(로그/카운터/직전 값 등)

- 레거시(jQuery/Vanilla) 코드와의 연동

## 주의사항

React가 관리하는 DOM을 파괴적으로 조작하면 안됨(충돌 위험).

- 렌더 중 ref.current를 읽거나 쓰지 않기:  
  → 필요한 정보는 state로 표현하고 이벤트 핸들러나 effect에서 다루고  
  React가 업데이트할 가능성이 없는 안전한 영역만 제한적으로 조작

### 파괴적 조작

- React가 렌더로 설정한 속성/구조를 직접 바꿔서  
  커밋 단계에서 덮어쓰이거나 불일치를 일으킬 가능성이 있는 조작.

### 비파괴적 조작

- DOM 구조나 React가 렌더로 설정한 속성은 건드리지 않고,  
  읽기/포커스/스크롤/측정/브라우저 고유 API 같은 부수효과성 작업만 하는 조작.

## 왜?

React의 단일 진실(SSOT)은 상태(state/props)이고, 이를 바탕으로 UI가 계산되는데,  
이렇게 계산된 UI를 useRef로 직접 조작하면 React의 상태와 불일치가 생김.

따라서 개발자는 무엇을 보여줄지 선언하고, 구현은 React에 위임해야 함.  
React의 구현에 간섭하면 예상치 못한 오류가 생길 수 있으며,  
\
이러한 부분이 바로 React가 선언적 UI모델이라는 특징임.

## useState vs useRef — 언제 무엇을 쓰나

### useState

- 적합:  
  변경 시 UI에 즉시 반영되어야 하는 값
  예) 입력값, 토글 상태, 로딩 여부

- 부적합(→ useRef에 적합):  
  UI에 영향이 없는 시스템 값을 useState로 관리하면 불필요한 렌더링 발생

### useRef

- 적합:  
  UI로 직접 표시하지 않는 값, 렌더링과 무관한 내부 값  
  예) 타이머/인터벌 ID, 외부 라이브러리 인스턴스, 직전 값 보관, DOM 노드 참조

- 부적합(→ useState에 적합):  
  렌더링에 영향을 주는 값, UI에 표시되는 값  
  예) 입력값, 토글 상태, 로딩 여부

useRef 변경은 렌더링을 유발하지 않음 → 화면 업데이트가 필요한 값은 useState로 관리해야 함.

## 원칙 — ref는 “탈출구”

렌더 트리 밖 작업(포커스, 스크롤, 측정, 브라우저/외부 API)에 ref 사용

## forwardRef — 부모의 ref를 자식 DOM으로 전달 (React 19 이전)

### 필요성

함수형 컴포넌트는 ref를 일반 props처럼 받지 못하므로,  
부모가 <Child ref={...} />로 준 ref를 자식의 특정 DOM에 연결하려면 **forwardRef**가 필요함.

### 언제?

- 외부 라이브러리가 자식의 실제 DOM에 포커스/위치 계산 등을 요구할 때

- 부모가 자식의 최상위 DOM에 접근해야 할 때

## useImperativeHandle — 노출 API를 “제한해서” 캡슐화

### 필요성

부모가 ref로 DOM 전체에 접근하면 자식의 내부 구조에 과도 의존하게됨  
→ 변경에 취약해짐

따라서 useImperativeHandle로 필요한 동작만 노출해 결합를 낮추는 것이 좋음.

### 효과

- 캡슐화:  
  부모는 내부 DOM 구조를 몰라도 됨

- 의존성 감소:  
  공개 API만 사용 → 유지보수성↑, 협업 안정성↑

</details>

##

<details><summary>flushSync — DOM 즉시 업데이트</summary>

## 사용처

일반적으로 setState는 비동기 배치로 처리되어 직후 DOM이 구 상태일 수 있음.  
이때 flushSync로 특정 업데이트를 동기 적용하면,  
DOM에 해당 블록 안에서 일으킨 업데이트가 반영됨 (렌더+커밋까지)

따라서 flushSync 직후에는 DOM과 바인딩된 ref를 신뢰할 수 있음

## 장점

직후 DOM 의존 코드(스크롤/측정)가 안전하게 동작

## 주의

- 과도 사용 시 배치 최적화 손실 → 꼭 필요한 곳에서만

## useRef와 활용시 예외

- Suspense 대기: 대상 컴포넌트(또는 조상)가 로딩 중이면  
  아직 커밋되지 않아 ref.current가 null일 수 있음. (이땐 fallback만 커밋됨)

- 하이드레이션: SSR 후 클라이언트에서 불일치(mismatch) 가 있으면  
  해당 서브트리는 폐기·재생성될 수 있어, 순간적으로 ref가 null→DOM으로 바뀔 수 있음.

### 따라서

가능하면 **레이아웃 의존 로직은 useLayoutEffect**에서 처리(가장 견고).

같은 이벤트 틱에 즉시 DOM이 필요할 때만 flushSync를 소량 사용.

</details>
