import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useCopyright } from '../hooks/useCopyright';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { copyright, getText } = useCopyright();

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
      <div className="admin-content">
        <Header title="Kilkari Care Foundation" toggleSidebar={toggleSidebar} />
        <main className="admin-main">
          <Outlet />
        </main>
        <footer className="admin-footer">
          <p>
            {getText()}
            {copyright?.showDesignedBy && copyright?.designedBy && (
              <>
                {' | Design &amp; Developed By '}
                {copyright.designedByUrl ? (
                  <a href={copyright.designedByUrl} target="_blank" rel="noopener noreferrer">
                    {copyright.designedBy}
                  </a>
                ) : (
                  copyright.designedBy
                )}
              </>
            )}
            {!copyright && (
              <>
                {' | Design & Developed By '}
                <a href="https://axsemsoftwares.com/" target="_blank" rel="noopener noreferrer">
                  Axsem Softwares
                </a>
              </>
            )}
          </p>
          {copyright?.links?.length > 0 && (
            <p className="footer-links">
              {copyright.links.map((link, i) => (
                <span key={i}>
                  {i > 0 && ' · '}
                  <a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a>
                </span>
              ))}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Layout;
