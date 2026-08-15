import AppHeader from '../../../shared/components/AppHeader';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader />
      <main className="p-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto mt-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Chào mừng bạn đã đăng nhập thành công!</h2>
          <p className="text-gray-500 text-lg">Hệ thống đang được xây dựng. Các tính năng sẽ sớm được ra mắt.</p>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
