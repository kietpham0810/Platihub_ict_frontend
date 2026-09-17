# PlatiHub ICT — Tổng quan dự án

> File này giúp nắm nhanh bối cảnh dự án mỗi khi mở terminal lại. Cập nhật khi kiến trúc/luồng nghiệp vụ thay đổi.

## ⚡ TRẠNG THÁI HIỆN TẠI (2026-09-16) — ĐÃ CHUYỂN SANG XAMPP
Dự án (FE + BE gộp chung) đã được copy toàn bộ vào **`C:\xampp\htdocs\Platihub\`** để chạy qua XAMPP (Apache) thay vì Docker. Cấu trúc bên trong giữ nguyên (`platihub-ict/`, `platihub-api-ict/`). **Luôn thao tác trên `C:\xampp\htdocs\Platihub\platihub-ict`**, không phải `E:\Platihub` (bản gốc/backup, không phải bản đang chạy).

Vì site nằm ở subfolder (không phải root domain), `vite.config.ts` đã set `base: '/Platihub/platihub-ict/dist/'` để asset (JS/CSS) load đúng đường dẫn. Nếu đổi vị trí thư mục trong `htdocs`, phải sửa lại `base` này rồi `npm run build` lại.

Backend (`platihub-api-ict`) cũng đã đổi từ MySQL sang **MongoDB Atlas** — xem `PROJECT.md` của BE để biết chi tiết, không ảnh hưởng gì đến code FE (format JSON response giữ nguyên).

Truy cập local:
- FE: `http://localhost/Platihub/platihub-ict/dist/` (đã build sẵn; sửa code xong phải `npm run build` lại mới thấy hiệu lực — không có dev-server hot-reload qua XAMPP)
- BE API: `http://localhost/Platihub/platihub-api-ict/api/*.php`
- `.env` đã trỏ `VITE_API_BASE_URL=http://localhost/Platihub/platihub-api-ict/api`

## Đây là gì?
Website giới thiệu công ty **PlatiHub** (mảng ICT) kèm hệ thống **quản lý sản phẩm (catalog)** có trang admin. Không phải "Graphyfi" — đây là một site React/Vite doanh nghiệp thông thường, có phần admin để duyệt/nhập sản phẩm, kể cả crawl (bot) dữ liệu từ trang khác.

## Stack kỹ thuật
- **Frontend**: React 19 + TypeScript + Vite, TailwindCSS 4 (qua `@tailwindcss/vite`)
- **Routing**: react-router-dom v7
- **i18n**: i18next / react-i18next (đa ngôn ngữ)
- **Backend**: API PHP nằm cạnh (`../platihub-api-ict`, cùng gộp trong `htdocs/Platihub`) — cấu hình qua `VITE_API_BASE_URL` trong `.env`. Các endpoint là các file `.php` (ví dụ `get_products.php`, `add_product.php`...), backend chạy PHP thuần trên XAMPP local, DB là **MongoDB Atlas** (không còn MySQL).
- Không có test framework, không có state management lib ngoài React hooks thuần.
- Chạy local qua **XAMPP** (không phải Vite dev server) vì cần Apache serve cả FE (`dist/`) lẫn BE (`.php`) cùng lúc trên `localhost` — tránh vấn đề CORS/port khác nhau. Muốn dùng `npm run dev` (hot reload) vẫn được, nhưng nhớ `.env` trỏ đúng API URL và chấp nhận chạy 2 origin khác nhau (CORS đã mở `*` ở BE nên vẫn gọi được).

## Cấu trúc thư mục chính (`src/`)
```
components/
  layout/     Header, Footer, MegaMenu (menu điều hướng)
  sections/   Các block trang chủ: Intro, About, Diagram, Promotion, Contact
  pages/      Products (danh sách sản phẩm), ProductDetail (chi tiết SP theo :id)
  admin/      Trang quản trị sản phẩm (route /admin)
    AdminProduct.tsx        - shell chính, quản lý tab (review/manual/manage)
    AdminProductTable.tsx   - bảng danh sách SP chờ duyệt / đã duyệt
    AdminProductManual.tsx  - form nhập tay 1 sản phẩm
    hooks/
      useProductData.ts   - fetch/duyệt/xóa/ẩn/sửa sản phẩm (gọi API PHP)
      useProductBot.ts     - chạy "bot" crawl sản phẩm từ URL ngoài (vd anphatpc) theo offset, phân trang, có thể dừng/tiếp tục
      useProductForm.ts    - state cho form thêm SP thủ công + upload ảnh
      useDialogs.ts        - quản lý các modal (confirm/result/bot-continue)
    modals/    Các dialog: xác nhận, kết quả, tiếp tục crawl, sửa SP
constants/config.ts   - SITE_CONFIG (thông tin liên hệ công ty), API_CONFIG (base URL + các endpoint PHP)
i18n/i18n.ts           - cấu hình đa ngôn ngữ
```

## Routes (App.tsx)
| Path | Trang |
|---|---|
| `/` | Trang chủ: Intro + About + Diagram |
| `/khuyen-mai` | Trang khuyến mãi |
| `/lien-he` | Liên hệ |
| `/san-pham` | Danh sách sản phẩm |
| `/product/:id` | Chi tiết sản phẩm |
| `/admin` | Trang quản trị sản phẩm |

## Luồng nghiệp vụ Admin (quan trọng)
1. **Tab "review"**: xem sản phẩm đang chờ duyệt (do bot crawl về hoặc nhập tay), có thể **approve / hide / delete**, chọn nhiều (bulk) qua checkbox.
2. **Tab "manual"**: nhập tay 1 sản phẩm mới (tên, hãng, loại, ảnh, mô tả, thông số kỹ thuật dạng key-value).
3. **Tab "manage"**: quản lý sản phẩm đã duyệt (approved).
4. **Bot crawl** (`useProductBot.ts`): nhập URL nguồn (vd trang anphatpc.com.vn) → gọi `bot_sync_anphatpc.php?url=...&offset=...` → backend crawl và trả về báo cáo (`BotReport`: số link tìm thấy, số SP mới thêm, số SP cập nhật thông số, `has_more`/`next_offset` để phân trang crawl tiếp). Nếu còn dữ liệu (`has_more=true`), hiện dialog hỏi người dùng có muốn tiếp tục crawl trang tiếp theo không (`BotContinueDialog`).
5. **Danh mục sản phẩm** cố định trong `types.ts` (`PRODUCT_CATEGORY_OPTIONS`): PC, Laptop, CPU, Mainboard, VGA, Linh kiện, Màn hình, HDD-SSD, Tản Nhiệt — dùng chung cho cả filter ở trang Products và form admin.

## Cấu hình môi trường (.env)
- `VITE_API_BASE_URL` — base URL của backend PHP (fallback về `/api` nếu thiếu)
- `VITE_TIMEOUT_MS` — timeout cho request API (mặc định 5000ms)
- Có `.env` (local) và `.env.production` riêng.

## Thông tin công ty (constants/config.ts)
- Địa chỉ: 159C Đề Thám, P. Cầu Ông Lãnh, TP.HCM
- Email: software@platihub.com, ict@platihub.com
- Giờ làm việc: T2–T6, 8:00–17:30

## Lệnh hay dùng
```bash
npm run dev       # chạy dev server (Vite)
npm run build     # build production
npm run lint      # eslint
npm run preview   # preview bản build
```

## Trạng thái làm việc gần đây
- **2026-09-16**: Chuyển từ Docker sang XAMPP (`htdocs`), thêm `base` vào `vite.config.ts` để chạy đúng ở subfolder, cập nhật `.env` trỏ API URL mới. Backend đổi MySQL → MongoDB Atlas (xem PROJECT.md bên BE).
- Trước đó (theo git log): `f5829fe` update ICT, `cf2542a` update product UIUX V1.1, `093d0f4` update product UIUX V1, `643f5f7` update admin UIUX V1, `ed69ea4` update admin UIUX → giai đoạn hoàn thiện UI/UX cho trang sản phẩm và trang admin quản lý sản phẩm.

⚠️ Thay đổi XAMPP/`vite.config.ts`/`.env` ở trên **chưa commit vào git**. Ngoài ra vẫn còn thay đổi cũ chưa commit ở: `AdminProductTable.tsx`, `Products.tsx`.
