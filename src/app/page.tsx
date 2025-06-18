'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="bg-circuit fixed inset-0" />

      {/* Floating Circuit Lines */}
      <div className="circuit-line" style={{ top: '15%', left: 0, width: '300px', animationDelay: '0s' }} />
      <div className="circuit-line" style={{ top: '35%', right: 0, width: '250px', animationDelay: '2s' }} />
      <div className="circuit-line" style={{ top: '55%', left: 0, width: '400px', animationDelay: '4s' }} />
      <div className="circuit-line" style={{ top: '75%', right: 0, width: '200px', animationDelay: '1s' }} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black border-b border-[#0ff3]">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="A&I Logo"
              width={160}
              height={40}
              className="h-10 w-auto hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] transition-all duration-300"
            />
          </div>
          <Link href="/ai/chat">
            <Button variant="outline" className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)]">
              시작하기
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h1 className="hero-title">AI를 더 똑똑하게 쓰는 법,</h1>
            <h2 className="hero-subtitle">A&I에서 시작하세요</h2>
            <p className="hero-description">
              질문을 개선하고, AI 응답을 체계적으로 관리하며, 개인화된 코칭으로 AI 활용 능력을
              향상시키는 스마트한 도구입니다.
            </p>
            <div className="flex gap-4">
              <Link href="/ai/chat">
                <Button className="bg-gradient-to-r from-[var(--primary)] to-[#0099ff] text-[var(--primary-foreground)] text-lg px-8 py-6 rounded-full hover:shadow-lg hover:shadow-[var(--primary)]/20 transition-all duration-300">
                  지금 시작하기 →
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="w-full aspect-square bg-gradient-to-br from-[var(--primary)]/20 to-transparent rounded-full flex items-center justify-center p-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4/5 h-4/5 rounded-full border-2 border-[var(--primary)]/30 animate-[spin_20s_linear_infinite]" />
                <div className="w-3/5 h-3/5 rounded-full border-2 border-[var(--primary)]/20 animate-[spin_15s_linear_infinite_reverse]" />
                <div className="w-2/5 h-2/5 rounded-full border-2 border-[var(--primary)]/10 animate-[spin_10s_linear_infinite]" />
              </div>
              <div className="relative z-10 text-9xl animate-[float_4s_ease-in-out_infinite]">🧠</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--primary)] mb-4">핵심 기능</h2>
            <p className="text-[var(--muted-foreground)] text-lg">
              A&I만의 특별한 기능들로 AI 활용 능력을 한 단계 끌어올리세요
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="feature-card">
              <div className="feature-icon">🧭</div>
              <h3 className="feature-title">대화 전 코칭</h3>
              <p className="feature-description">
                질문 입력 → AI가 질문을 다듬고, 핵심 키워드와 요약, 추천 질문까지 제안합니다.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">AI 질문</h3>
              <p className="feature-description">
                다듬어진 질문으로 A&I에게 물어보고, 정확한 답변을 받아보세요.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">대화 후 코칭</h3>
              <p className="feature-description">
                답변을 분석해 핵심 키워드, 요약, 패턴, 영향도를 파악하고 기억에 저장합니다.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3 className="feature-title">Insight Map</h3>
              <p className="feature-description">
                Context를 시각화된 키워드와 요약으로 정리하여 지식을 체계적으로 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center gap-8 mb-8">
            <a href="https://github.com/nodit-developers/Lambda_Hackathon_2025" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              GitHub
            </a>
            <a href="mailto:Richard@lambda256.io" className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              개발자 문의
            </a>
            <Link href="/guide" className="text-[var(--primary)] hover:text-[var(--primary)]/80">
              사용 가이드
            </Link>
          </div>
          <div className="text-[var(--muted-foreground)]">
            <p className="font-bold mb-2">Lambda Hackathon 2025</p>
            <p>개발자: Richard (richard@lambda256.io)</p>
            <p>© 2025 A&I. AI를 더 똑똑하게 사용하는 방법을 제공합니다.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
