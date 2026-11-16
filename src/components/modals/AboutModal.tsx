import React from 'react';
import { ArrowUpRight, GitFork, Layers3, TestTube2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../i18n';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { language } = useTranslation();
  const text = (vi: string, en: string) => language === 'en' ? en : vi;
  return (
  <Modal isOpen={isOpen} onClose={onClose} title={text('Giới thiệu', 'About')} subtitle="OjGen Web" size="sm">
    <div className="about-content">
      <div className="about-heading">
        <div className="about-logo" aria-hidden="true">OJ</div>
        <div>
          <div className="about-title-row">
            <h3>OjGen Web</h3>
            <span className="about-version">v3.3.0</span>
          </div>
          <p>{text('Công cụ tạo bộ test cho lập trình thi đấu', 'Test generation for competitive programming')}</p>
        </div>
      </div>

      <p className="about-description">
        {text('Tạo dữ liệu, kiểm tra input và chuẩn bị gói bài tập ngay trong trình duyệt.', 'Generate data, validate input and prepare problem packages in your browser.')}
      </p>

      <div className="about-features">
        <div><TestTube2 size={18} aria-hidden="true" /><span><strong>{text('19 khuôn dữ liệu', '19 input templates')}</strong><small>{text('Sinh test có thể tái lập bằng seed', 'Reproduce generated tests with a seed')}</small></span></div>
        <div><Layers3 size={18} aria-hidden="true" /><span><strong>{text('Công cụ soạn bài', 'Problem authoring')}</strong><small>{text('Quản lý test, đề bài và gói ZIP', 'Manage tests, statements and ZIP packages')}</small></span></div>
      </div>

      <div className="about-meta"><span>{text('Phiên bản Web', 'Web edition')}</span><span>React · TypeScript · Vite</span></div>
      <a className="about-repo-link" href="https://github.com/Namtudifreefire/OjGen-Web" target="_blank" rel="noopener noreferrer">
        <GitFork size={18} aria-hidden="true" /> {text('Xem mã nguồn trên GitHub', 'View source on GitHub')} <ArrowUpRight size={16} aria-hidden="true" />
      </a>
      <p className="about-credit">{text('Phát triển bởi Namtudifreefire', 'Developed by Namtudifreefire')}</p>
    </div>
  </Modal>
  );
};
