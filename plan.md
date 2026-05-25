# Admin 페이지 페이지네이션 구현 계획

## 대상 파일
- `src/pages/UserAdmin.jsx`
- `src/pages/StoreAdmin.jsx`
- `src/pages/ReservationAdmin.jsx`

---

## 변경 요약

### 1. 상태(State) 추가

각 페이지에 아래 세 상태를 추가한다.

```js
const [page, setPage] = useState(0);       // 현재 페이지 (0-based, Spring 기준)
const [size, setSize] = useState(10);      // 페이지당 항목 수
const [pageInfo, setPageInfo] = useState({ totalPages: 0, totalElements: 0 });
```

---

### 2. 요청(Request) 변경

기존 params에 `page`와 `size`를 추가한다.

**Before**
```js
const params = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v));
api.get('/admin/users', { params })
```

**After**
```js
const params = {
  ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
  page,
  size,
};
api.get('/admin/users', { params })
```

---

### 3. 응답(Response) 변경

응답 구조가 `List` → `Page`로 바뀌므로 데이터 접근 경로를 변경한다.

**Before**
```js
.then(res => {
  setUsers(res.data);
  if (res.data.length === 0) { ... }
})
```

**After**
```js
.then(res => {
  setUsers(res.data.content);
  setPageInfo({ totalPages: res.data.totalPages, totalElements: res.data.totalElements });
  if (res.data.content.length === 0) { ... }
})
```

---

### 4. 검색 시 페이지 초기화

검색 버튼 클릭 시 page를 0으로 리셋한 뒤 fetch를 호출한다.

```js
const handleSearch = () => {
  setPage(0);     // 검색 조건 변경 시 첫 페이지로
  fetchUsers();   // 각 페이지에 맞는 fetch 함수 호출
};
```

> 주의: `setPage(0)` 후 바로 fetch를 호출하면 아직 page가 0으로 업데이트되지 않을 수 있으므로,
> fetch 함수에 page 인자를 직접 넘기는 방식으로 처리한다.

**fetchUsers 시그니처 변경**
```js
const fetchUsers = (currentPage = page, currentSize = size) => {
  const params = {
    ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
    page: currentPage,
    size: currentSize,
  };
  ...
};

const handleSearch = () => {
  setPage(0);
  fetchUsers(0);
};

// size 변경 시: 첫 페이지로 이동 후 재조회
const handleSizeChange = (newSize) => {
  setSize(newSize);
  setPage(0);
  fetchUsers(0, newSize);
};
```

---

### 5. 페이지 변경 시 자동 fetch

`page` 상태가 바뀔 때 자동으로 데이터를 다시 가져온다.

```js
useEffect(() => {
  fetchUsers(page, size);
}, [page]);
```

> 기존 `useEffect(() => { fetchUsers(); }, [])` 을 이 방식으로 대체한다.
> `page`가 0일 때도 최초 1회 실행되므로 초기 로딩은 그대로 동작한다.
> `size` 변경은 `handleSizeChange`에서 직접 `fetchUsers(0, newSize)`를 호출하므로 별도 effect 불필요.

---

### 6. 페이지 사이즈 선택 UI 추가

필터 섹션 우측 또는 테이블 상단에 페이지 사이즈 선택 라디오 버튼을 추가한다.

```jsx
{/* 페이지 사이즈 선택 */}
<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
  <span style={{ fontSize: '13px', color: '#666' }}>페이지당 항목:</span>
  {[10, 50, 100].map(s => (
    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px' }}>
      <input
        type="radio"
        name="pageSize"
        value={s}
        checked={size === s}
        onChange={() => handleSizeChange(s)}
      />
      {s}건
    </label>
  ))}
</div>
```

### 7. 페이지네이션 UI 추가

테이블 하단에 페이지 이동 버튼을 추가한다.

```jsx
{/* 페이지네이션 */}
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
  <button
    onClick={() => setPage(p => p - 1)}
    disabled={page === 0}
    style={{ padding: '6px 12px', cursor: 'pointer' }}
  >
    이전
  </button>

  {Array.from({ length: pageInfo.totalPages }, (_, i) => (
    <button
      key={i}
      onClick={() => setPage(i)}
      style={{
        padding: '6px 12px',
        background: page === i ? '#673ab7' : '#fff',
        color: page === i ? '#fff' : '#333',
        border: '1px solid #ddd',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: page === i ? 'bold' : 'normal',
      }}
    >
      {i + 1}
    </button>
  ))}

  <button
    onClick={() => setPage(p => p + 1)}
    disabled={page >= pageInfo.totalPages - 1}
    style={{ padding: '6px 12px', cursor: 'pointer' }}
  >
    다음
  </button>
</div>
```

---

## 파일별 변경 포인트 요약

| 파일 | 상태 변수 | 데이터 변수 | API 경로 |
|------|-----------|-------------|----------|
| UserAdmin.jsx | `users` | `res.data.content` | `/admin/users` |
| StoreAdmin.jsx | `stores` | `res.data.content` | `/admin/stores` |
| ReservationAdmin.jsx | `reservations` | `res.data.content` | `/admin/reservations` |

---

## 변경하지 않는 것

- 필터 입력 UI (keyword, loginType/category/status 등)
- 테이블 컬럼 구조
- 탭 메뉴 (유저/가게/예약 관리)
- Swal 알림 (검색 결과 없음)
- 기존 스타일 (inline style 유지)