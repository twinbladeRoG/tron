import UploadForm from '@/components/modules/files/UploadForm';
import UserFiles from '@/components/modules/files/UserFiles';

const FilesPage = () => {
  return (
    <div>
      <UploadForm />
      <UserFiles />
    </div>
  );
};

export default FilesPage;
