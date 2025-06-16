import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="w-48 pt-10 bg-[#333333] text-white h-screen flex flex-col gap-2 z-40">
      <Link to="/admin" className={`p-4 hover:bg-[#222222] ${isActive('/admin') && !isActive('/admin/pet') && !isActive('/admin/artifact') ? 'bg-[#222222}' : ''}`}>Quản lý tướng</Link>
      <Link to="/admin/pet" className={`p-4 hover:bg-[#222222] ${isActive('/admin/pet') ? 'bg-[#222222]' : ''}`}>Quản lý linh thú</Link>
      <Link to="/admin/artifact" className={`p-4 hover:bg-[#222222] ${isActive('/admin/artifact') ? 'bg-[#222222]' : ''}`}>Quản lý bảo vật</Link>
    </div>
  );
};

export default AdminSidebar;