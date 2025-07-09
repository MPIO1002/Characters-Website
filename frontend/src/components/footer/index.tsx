import useWebSocket from '../../hooks/useWebSocket';

const index = () => {
  const { stats, isConnected } = useWebSocket();

  return (
    <div className="bg-[#1e1e1e] p-4 text-white text-xs md:text-sm flex flex-col items-center justify-center h-50 text-center">
      {/* Thống kê người truy cập */}
      <div className="mb-4 flex flex-col md:flex-row items-center justify-center gap-4 w-full">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`font-semibold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            {stats.online} người đang online
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-blue-400 font-semibold">
            {stats.total} lượt truy cập
          </span>
        </div>
      </div>
      
      {/* Thông tin công ty */}
      <p className="font-bold">Phát hành bởi Công ty Cổ phần GGO</p>
      <p>Giấy phép cung cấp dịch vụ trò chơi điện tử G1 trên mạng số: 103/GP-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 16/3/2020</p>
      <p>Quyết định phê duyệt nội dung kịch bản trò chơi điện tử G1 trên mạng số: 861/QĐ-BTTTT do Bộ Thông tin và Truyền thông cấp ngày 21/05/2020</p>
    </div>
  )
}

export default index