# 배포 및 운영 가이드

## 개요
이 문서는 A&I 프로젝트의 배포 및 운영 방법을 안내합니다. Vercel을 통한 배포, 환경 변수 관리, 데이터베이스 운영, 모니터링, 롤백 및 백업 전략, 운영 팁 등을 포함합니다.

---

## 1. Vercel을 통한 배포
1. [Vercel](https://vercel.com/) 계정을 생성하고 로그인합니다.
2. GitHub(또는 GitLab, Bitbucket) 저장소를 Vercel에 연결합니다.
3. "New Project"를 클릭하고 해당 저장소를 선택합니다.
4. 빌드 설정은 기본값(Next.js)으로 두고, 환경 변수(아래 참고)를 추가합니다.
5. "Deploy"를 클릭하면 자동으로 배포가 시작됩니다.
6. 배포가 완료되면 Vercel에서 제공하는 도메인으로 접속할 수 있습니다.

---

## 2. 환경 변수 설정
- Vercel의 프로젝트 Settings > Environment Variables에서 아래와 같이 환경 변수를 등록합니다.
  - `DATABASE_URL`: PostgreSQL 연결 문자열
  - `API_KEY`: Gemini API Key 등 필요한 외부 API 키
- 환경 변수 변경 시, 재배포가 필요합니다.

---

## 3. 데이터베이스 운영
- Neon(또는 Supabase)에서 PostgreSQL 인스턴스를 생성하고, 연결 정보를 환경 변수로 등록합니다.
- Prisma 마이그레이션은 로컬에서 적용 후, 변경된 스키마를 커밋하여 배포합니다.
- 운영 환경에서 데이터베이스 백업 및 복구 정책을 마련합니다.

---

## 4. 모니터링 및 로깅
- Vercel Analytics, Sentry, Logtail 등 외부 모니터링/로깅 서비스를 연동할 수 있습니다.
- 에러 발생 시 알림을 받을 수 있도록 설정합니다.

---

## 5. 롤백 및 백업
- Vercel의 "Deployments" 메뉴에서 이전 배포로 롤백할 수 있습니다.
- 데이터베이스는 정기적으로 백업하고, 필요 시 복구할 수 있도록 합니다.

---

## 6. 운영 팁
- 운영 중 장애 발생 시, Vercel의 상태 페이지와 로그를 확인하세요.
- 데이터베이스 연결 수 제한, 쿼리 최적화 등 운영 환경에 맞는 튜닝이 필요합니다.
- 보안상 중요한 환경 변수는 외부에 노출되지 않도록 주의하세요.

---

## 참고 자료
- [Vercel 공식 문서](https://vercel.com/docs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)
- [Neon 공식 문서](https://neon.tech/docs)