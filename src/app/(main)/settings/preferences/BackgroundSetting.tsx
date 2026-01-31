import { Button, Column, Row, TextField } from '@umami/react-zen';
import { useRef, useState } from 'react';
import { useLoginQuery, useMessages, useUpdateQuery } from '@/components/hooks';

export function BackgroundSetting() {
  const { user, setUser } = useLoginQuery();
  const { formatMessage, labels } = useMessages();
  const [url, setUrl] = useState(user?.backgroundUrl || '');
  const { mutate, isPending } = useUpdateQuery(`/users/${user?.id}`);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    mutate(
      { backgroundUrl: url },
      {
        onSuccess: () => {
          setUser({ ...user, backgroundUrl: url });
        },
      },
    );
  };

  const handleReset = () => {
    setUrl('');
    mutate(
      { backgroundUrl: '' },
      {
        onSuccess: () => {
          setUser({ ...user, backgroundUrl: '' });
        },
      },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('文件太大，请选择 2MB 以下的图片');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getPreviewUrl = (val: string) => {
    if (!val) return '';
    if (val === 'https://pic.2x.nz/' || val === 'https://pic.2x.nz') {
      // 预览时固定选第一张或者随机选一张，这里为了演示选第 100 张
      return `https://pic1.acofork.com/ri/h/100.webp`;
    }
    if (val.startsWith('http')) {
      return `${process.env.basePath || ''}/api/proxy?url=${encodeURIComponent(val)}`;
    }
    return val;
  };

  return (
    <Column gap="3">
      <Row gap="3">
        <TextField
          value={url}
          onChange={setUrl}
          placeholder="https://example.com/image.jpg"
          style={{ flex: 1 }}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
        <Button onPress={() => setUrl('https://pic.2x.nz/')} disabled={isPending}>
          随机图片
        </Button>
        <Button onPress={handleUploadClick} disabled={isPending}>
          {formatMessage(labels.upload)}
        </Button>
        <Button
          variant="primary"
          onPress={handleSave}
          disabled={isPending || url === (user?.backgroundUrl || '')}
        >
          {formatMessage(labels.save)}
        </Button>
        <Button onPress={handleReset} disabled={isPending || !url}>
          {formatMessage(labels.reset)}
        </Button>
      </Row>

      {url && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>预览:</p>
          <div
            style={{
              width: '200px',
              height: '120px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundImage: `url("${getPreviewUrl(url)}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: '#f0f0f0',
            }}
          />
        </div>
      )}

      <p style={{ fontSize: '12px', color: '#888' }}>
        提示: 请使用直接的图片链接 (以 .jpg, .png 等结尾) 或上传本地图片。 当前 URL 报错
        `net::ERR_ABORTED` 通常是因为该服务器拒绝了来自您浏览器的请求。
      </p>
    </Column>
  );
}
