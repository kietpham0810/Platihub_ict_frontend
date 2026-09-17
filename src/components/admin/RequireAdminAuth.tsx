import { Navigate } from 'react-router-dom';
import { getAdminToken } from '../../constants/config';

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  // Chỉ kiểm tra token có tồn tại để tránh render nhấp nháy trang admin
  // trước khi gọi API. Token còn hợp lệ hay không (hạn 12h, chữ ký đúng)
  // luôn được backend xác minh lại ở mỗi request ghi/xóa dữ liệu.
  const isAuthenticated = !!getAdminToken();

  if (!isAuthenticated) {
    return <Navigate to="/?admin_auth_required=1" replace />;
  }

  return <>{children}</>;
}
