import Logout from "@/components/auth/Logout";
import { useAuthStore } from "@/stores/useAuthStore";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Chào buổi sáng";
  if (hour >= 12 && hour < 17) return "Chào buổi trưa";
  if (hour >= 17 && hour < 20) return "Chào buổi chiều";
  return "Chào buổi tối";
};

const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user);
  const greeting = getGreeting();

  return (
    <main className="min-h-screen bg-muted px-4 py-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl bg-white/80 p-8 shadow-lg ring-1 ring-border backdrop-blur-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-primary/80">
                {greeting}
              </p>
              <h1 className="mt-2 text-4xl font-semibold text-slate-950 sm:text-5xl">
                {user?.firstName || user?.username || "Bạn"}, chào mừng đến với
                Moji.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Đây là không gian chat của bạn. Bắt đầu gửi tin nhắn, tạo kết
                nối và giữ liên lạc với bạn bè ngay bây giờ.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Logout />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl bg-white/85 p-6 shadow-lg ring-1 ring-border backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4 pb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Tin nhắn gần đây
                </h2>
                <p className="text-sm text-slate-500">
                  Màn hình chat chính của bạn.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">09:24</p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  Xin chào! Bạn có muốn bắt đầu trò chuyện không?
                </p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">08:55</p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  Mời thử tính năng chat trực tiếp ngay hôm nay.
                </p>
              </article>
            </div>
          </div>

          <aside className="rounded-3xl bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-6 shadow-lg ring-1 ring-border backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-950">
              Gợi ý cho bạn
            </h2>
            <ul className="mt-4 space-y-4 text-slate-700">
              <li className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-medium">Bắt đầu chat</p>
                <p className="mt-1 text-sm text-slate-500">
                  Gửi tin nhắn tới bạn bè hoặc đồng nghiệp ngay lập tức.
                </p>
              </li>
              <li className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-medium">Tạo nhóm</p>
                <p className="mt-1 text-sm text-slate-500">
                  Kết nối nhiều người cùng lúc trong cuộc trò chuyện nhóm.
                </p>
              </li>
              <li className="rounded-2xl bg-white/80 p-4 shadow-sm">
                <p className="text-sm font-medium">Quản lý thông báo</p>
                <p className="mt-1 text-sm text-slate-500">
                  Luôn cập nhật các tin nhắn mới quan trọng.
                </p>
              </li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default ChatAppPage;
