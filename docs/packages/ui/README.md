# UI Package

The `@vidflow/ui` package provides a comprehensive UI component library built with React and Tailwind CSS. It offers reusable, accessible, and customizable components for all VidFlow frontend applications.

## Purpose

- **Consistency**: Unified design across all apps
- **Reusability**: Shared components for web, extension, mini-program
- **Accessibility**: WCAG 2.1 compliant components
- **Theming**: Customizable design tokens

## Installation

```bash
npm install @vidflow/ui
```

## Components

### Core Components

#### Button

```typescript
import { Button } from '@vidflow/ui';

<Button variant="primary" size="md">
  Download
</Button>

<Button variant="secondary" size="sm">
  Cancel
</Button>

<Button variant="ghost" disabled>
  Processing
</Button>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'ghost' | 'primary' | Button style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| disabled | boolean | false | Disabled state |
| loading | boolean | false | Loading state |
| icon | ReactNode | - | Icon element |

#### Input

```typescript
import { Input } from '@vidflow/ui';

<Input
  placeholder="Enter video URL"
  onChange={handleChange}
/>

<Input
  label="Video URL"
  error="Invalid URL format"
  icon={<LinkIcon />}
/>
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label text |
| error | string | - | Error message |
| icon | ReactNode | - | Input icon |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Input size |

#### Card

```typescript
import { Card } from '@vidflow/ui';

<Card>
  <CardThumbnail src="https://..." />
  <CardContent>
    <CardTitle>Video Title</CardTitle>
    <CardMeta>Channel • 1.2M views</CardMeta>
  </CardContent>
  <CardActions>
    <Button>Download</Button>
  </CardActions>
</Card>
```

### Video Components

#### VideoCard

```typescript
import { VideoCard } from '@vidflow/ui';

<VideoCard
  video={{
    id: 'abc123',
    title: 'Amazing Video',
    thumbnail: 'https://...',
    duration: 180,
    channel: 'Channel Name',
    views: 1200000
  }}
  onDownload={() => handleDownload()}
/>
```

#### VideoPlayer

```typescript
import { VideoPlayer } from '@vidflow/ui';

<VideoPlayer
  src="https://..."
  poster="https://..."
  autoPlay={false}
  controls={true}
/>
```

#### DownloadCard

```typescript
import { DownloadCard } from '@vidflow/ui';

<DownloadCard
  job={{
    id: 'job123',
    title: 'Video Title',
    progress: 65,
    status: 'downloading',
    speed: 2500000
  }}
  onCancel={() => cancelJob()}
/>
```

### Form Components

#### Select

```typescript
import { Select } from '@vidflow/ui';

<Select
  label="Quality"
  options={[
    { value: '1080p', label: '1080p HD' },
    { value: '720p', label: '720p' },
    { value: '480p', label: '480p' }
  ]}
  value={selectedQuality}
  onChange={setQuality}
/>
```

#### QualityPicker

```typescript
import { QualityPicker } from '@vidflow/ui';

<QualityPicker
  availableQualities={['144p', '240p', '360p', '480p', '720p', '1080p']}
  selected="1080p"
  onSelect={setQuality}
/>
```

#### URLInput

```typescript
import { URLInput } from '@vidflow/ui';

<URLInput
  onSubmit={parseVideo}
  placeholder="Paste video URL here..."
  isLoading={isParsing}
/>
```

### Layout Components

#### Container

```typescript
import { Container } from '@vidflow/ui';

<Container size="md">
  <h1>Content</h1>
</Container>
```

#### Grid

```typescript
import { Grid } from '@vidflow/ui';

<Grid cols={3} gap="md">
  <VideoCard />
  <VideoCard />
  <VideoCard />
</Grid>
```

#### Modal

```typescript
import { Modal } from '@vidflow/ui';

<Modal
  isOpen={isOpen}
  onClose={close}
  title="Download Complete"
>
  <p>Video saved to Downloads folder</p>
</Modal>
```

### Feedback Components

#### ProgressBar

```typescript
import { ProgressBar } from '@vidflow/ui';

<ProgressBar
  value={65}
  max={100}
  showLabel
  variant="primary"
/>
```

#### Spinner

```typescript
import { Spinner } from '@vidflow/ui';

<Spinner size="md" />
```

#### Toast

```typescript
import { Toast } from '@vidflow/ui';

<Toast
  type="success"
  message="Download complete"
  onClose={() => {}}
/>
```

## Theming

### Design Tokens

```typescript
// Custom theme
import { theme } from '@vidflow/ui';

const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    primary: '#FF0000',
    secondary: '#00FF00',
  },
};
```

### CSS Variables

```css
:root {
  --vidflow-color-primary: #007aff;
  --vidflow-color-secondary: #5856d6;
  --vidflow-radius-md: 8px;
  --vidflow-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

## Hooks

### useToast

```typescript
import { useToast } from '@vidflow/ui';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Download complete!');
  };

  const handleError = () => {
    toast.error('Failed to download');
  };
}
```

### useModal

```typescript
import { useModal } from '@vidflow/ui';

function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <Button onClick={open}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={close}>
        Content
      </Modal>
    </>
  );
}
```

## Icons

```typescript
import { Icon } from '@vidflow/ui';
import { Download, Play, Pause } from '@vidflow/ui/icons';

<Icon as={Download} size="md" />
<Icon as={Play} size="sm" />
```

## Project Structure

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── VideoCard/
│   │   ├── VideoPlayer/
│   │   ├── DownloadCard/
│   │   ├── QualityPicker/
│   │   ├── URLInput/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── ProgressBar/
│   │   ├── Spinner/
│   │   ├── Toast/
│   │   ├── Grid/
│   │   ├── Container/
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useToast.ts
│   │   ├── useModal.ts
│   │   └── index.ts
│   ├── icons/
│   │   ├── index.ts
│   │   └── icons.ts
│   ├── theme/
│   │   ├── tokens.ts
│   │   ├── index.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── jest.config.js
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `tailwindcss` >= 3.0.0
- `lucide-react` - Icon library

## Accessibility

All components follow WCAG 2.1 guidelines:

- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance
- ARIA attributes

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)
