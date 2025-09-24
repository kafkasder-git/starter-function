// Global type declarations for external packages

// Sonner toast notifications
declare module 'sonner' {
  export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    description?: string;
  }

  export function toast(
    message: string,
    options?: {
      description?: string;
      duration?: number;
      type?: 'success' | 'error' | 'info' | 'warning';
    },
  ): void;

  export function Toaster(): JSX.Element;

  // Toast function with methods
  interface ToastFunction {
    (
      message: string,
      options?: {
        description?: string;
        duration?: number;
        type?: 'success' | 'error' | 'info' | 'warning';
      },
    ): void;

    success: (message: string, options?: { description?: string; duration?: number }) => void;
    error: (message: string, options?: { description?: string; duration?: number }) => void;
    info: (message: string, options?: { description?: string; duration?: number }) => void;
    warning: (message: string, options?: { description?: string; duration?: number }) => void;
    loading: (message: string, options?: { description?: string; duration?: number }) => void;
    dismiss: (toastId?: string | number) => void;
    promise: <T>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      },
    ) => Promise<T>;
  }

  export const toast: ToastFunction;

  // Also declare as namespace for method access
  export namespace toast {
    function success(message: string, options?: { description?: string; duration?: number }): void;
    function error(message: string, options?: { description?: string; duration?: number }): void;
    function info(message: string, options?: { description?: string; duration?: number }): void;
    function warning(message: string, options?: { description?: string; duration?: number }): void;
    function loading(message: string, options?: { description?: string; duration?: number }): void;
    function dismiss(toastId?: string | number): void;
    function promise<T>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      },
    ): Promise<T>;
  }
}

// Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

declare class SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
}

declare class SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

declare class SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

declare class SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

declare class SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

declare class SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare class SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

declare class SpeechGrammar {
  src: string;
  weight: number;
}

// Radix UI components
declare module '@radix-ui/react-alert-dialog@1.1.6' {
  export * from '@radix-ui/react-alert-dialog';
}

declare module '@radix-ui/react-avatar@1.1.3' {
  export * from '@radix-ui/react-avatar';
}

declare module '@radix-ui/react-checkbox@1.1.4' {
  export * from '@radix-ui/react-checkbox';
}

declare module '@radix-ui/react-dialog@1.1.6' {
  export * from '@radix-ui/react-dialog';
}

declare module '@radix-ui/react-dropdown-menu@2.1.6' {
  export * from '@radix-ui/react-dropdown-menu';
}

declare module '@radix-ui/react-label@2.1.2' {
  export * from '@radix-ui/react-label';
}

declare module '@radix-ui/react-slot@1.1.2' {
  export * from '@radix-ui/react-slot';
}

declare module '@radix-ui/react-popover@1.1.6' {
  export * from '@radix-ui/react-popover';
}

declare module '@radix-ui/react-radio-group@1.2.3' {
  export * from '@radix-ui/react-radio-group';
}

declare module '@radix-ui/react-scroll-area@1.2.3' {
  export * from '@radix-ui/react-scroll-area';
}

declare module '@radix-ui/react-select@2.1.6' {
  export * from '@radix-ui/react-select';
}

declare module '@radix-ui/react-separator@1.1.2' {
  export * from '@radix-ui/react-separator';
}

declare module '@radix-ui/react-switch@1.1.3' {
  export * from '@radix-ui/react-switch';
}

declare module '@radix-ui/react-tabs@1.1.3' {
  export * from '@radix-ui/react-tabs';
}

declare module '@radix-ui/react-tooltip@1.1.8' {
  export * from '@radix-ui/react-tooltip';
}

// Lucide React icons
declare module 'lucide-react@0.487.0' {
  export interface IconProps {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
    className?: string;
  }

  export type Icon = React.ComponentType<IconProps>;

  export const Activity: Icon;
  export const AlertCircle: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const Bell: Icon;
  export const Calendar: Icon;
  export const Check: Icon;
  export const CheckIcon: Icon;
  export const ChevronDown: Icon;
  export const ChevronDownIcon: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const ChevronRightIcon: Icon;
  export const ChevronUp: Icon;
  export const ChevronUpIcon: Icon;
  export const Circle: Icon;
  export const CircleIcon: Icon;
  export const Clock: Icon;
  export const Download: Icon;
  export const Edit: Icon;
  export const Eye: Icon;
  export const FileText: Icon;
  export const Filter: Icon;
  export const Home: Icon;
  export const Info: Icon;
  export const LogOut: Icon;
  export const Mail: Icon;
  export const Menu: Icon;
  export const MessageSquare: Icon;
  export const MoreHorizontal: Icon;
  export const MoreVertical: Icon;
  export const Phone: Icon;
  export const Plus: Icon;
  export const Search: Icon;
  export const Settings: Icon;
  export const Trash2: Icon;
  export const Upload: Icon;
  export const User: Icon;
  export const Users: Icon;
  export const X: Icon;
  export const XIcon: Icon;

  // Add more icons as needed
  export const icons: Record<string, Icon>;
}

// React Hook Form
declare module 'react-hook-form@7.55.0' {
  export interface UseFormProps<TFieldValues = Record<string, any>> {
    defaultValues?: TFieldValues;
    mode?: 'onChange' | 'onBlur' | 'onSubmit';
    reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
    resolver?: any;
    context?: any;
    criteriaMode?: 'firstError' | 'all';
    shouldFocusError?: boolean;
    shouldUnregister?: boolean;
    shouldUseNativeValidation?: boolean;
    delayError?: number;
  }

  export interface UseFormReturn<TFieldValues = Record<string, any>> {
    control: any;
    formState: {
      errors: any;
      isDirty: boolean;
      isLoading: boolean;
      isSubmitted: boolean;
      isSubmitSuccessful: boolean;
      isSubmitting: boolean;
      isValid: boolean;
      isValidating: boolean;
      submitCount: number;
      touchedFields: any;
      dirtyFields: any;
    };
    getFieldState: (name: string) => any;
    getValues: (payload?: any) => TFieldValues;
    handleSubmit: (
      onValid: (data: TFieldValues) => void,
      onInvalid?: (errors: any) => void,
    ) => (e?: any) => void;
    register: (name: string, options?: any) => any;
    reset: (values?: TFieldValues, options?: any) => void;
    setError: (name: string, error: any, options?: any) => void;
    setFocus: (name: string, options?: any) => void;
    setValue: (name: string, value: any, options?: any) => void;
    trigger: (name?: string) => Promise<boolean>;
    unregister: (name: string, options?: any) => void;
    watch: (name?: string, defaultValue?: any) => any;
  }

  export function useForm<TFieldValues = Record<string, any>>(
    props?: UseFormProps<TFieldValues>,
  ): UseFormReturn<TFieldValues>;
  export function useFormContext<TFieldValues = Record<string, any>>(): UseFormReturn<TFieldValues>;
  export function useController(props: any): any;
  export function useFieldArray(props: any): any;
  export function useWatch(props: any): any;
  export function Controller(props: any): any;
  export function FormProvider(props: any): any;

  // Missing exports
  export function useFormState(props: any): any;
  export interface ControllerProps {
    name: string;
    control: any;
    render: (props: any) => React.ReactElement;
    defaultValue?: any;
  }
  export type FieldPath<TFieldValues> = string;
  export type FieldValues = Record<string, any>;
}

// Recharts
declare module 'recharts/lib/component/ResponsiveContainer' {
  import { ReactElement } from 'react';

  interface ResponsiveContainerProps {
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    aspect?: number;
    children?: ReactElement;
    className?: string;
  }

  export const ResponsiveContainer: React.ComponentType<ResponsiveContainerProps>;
}

declare module 'recharts/lib/chart/LineChart' {
  import { ReactElement } from 'react';

  interface LineChartProps {
    width?: number;
    height?: number;
    data?: any[];
    children?: ReactElement | ReactElement[];
    className?: string;
  }

  export const LineChart: React.ComponentType<LineChartProps>;
}

declare module 'recharts/lib/cartesian/Line' {
  interface LineProps {
    type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey?: string | number | ((obj: any) => any);
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string | number;
    dot?: boolean | any;
    activeDot?: boolean | any;
    connectNulls?: boolean;
    children?: React.ReactNode;
  }

  export const Line: React.ComponentType<LineProps>;
}

declare module 'recharts/lib/chart/AreaChart' {
  import { ReactElement } from 'react';

  interface AreaChartProps {
    width?: number;
    height?: number;
    data?: any[];
    children?: ReactElement | ReactElement[];
    className?: string;
  }

  export const AreaChart: React.ComponentType<AreaChartProps>;
}

declare module 'recharts/lib/cartesian/Area' {
  interface AreaProps {
    type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter';
    dataKey?: string | number | ((obj: any) => any);
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
    strokeDasharray?: string | number;
    dot?: boolean | any;
    activeDot?: boolean | any;
    connectNulls?: boolean;
    children?: React.ReactNode;
  }

  export const Area: React.ComponentType<AreaProps>;
}

declare module 'recharts/lib/chart/BarChart' {
  import { ReactElement } from 'react';

  interface BarChartProps {
    width?: number;
    height?: number;
    data?: any[];
    children?: ReactElement | ReactElement[];
    className?: string;
  }

  export const BarChart: React.ComponentType<BarChartProps>;
}

declare module 'recharts/lib/cartesian/Bar' {
  interface BarProps {
    dataKey?: string | number | ((obj: any) => any);
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    radius?: number | number[];
    children?: React.ReactNode;
  }

  export const Bar: React.ComponentType<BarProps>;
}

declare module 'recharts/lib/cartesian/XAxis' {
  interface XAxisProps {
    dataKey?: string | number | ((obj: any) => any);
    type?: 'number' | 'category';
    domain?: any[];
    tick?: boolean | any;
    axisLine?: boolean;
    tickLine?: boolean;
    stroke?: string;
    fontSize?: number;
    children?: React.ReactNode;
  }

  export const XAxis: React.ComponentType<XAxisProps>;
}

declare module 'recharts/lib/cartesian/YAxis' {
  interface YAxisProps {
    type?: 'number' | 'category';
    domain?: any[];
    tick?: boolean | any;
    axisLine?: boolean;
    tickLine?: boolean;
    stroke?: string;
    fontSize?: number;
    children?: React.ReactNode;
  }

  export const YAxis: React.ComponentType<YAxisProps>;
}

declare module 'recharts/lib/cartesian/CartesianGrid' {
  interface CartesianGridProps {
    strokeDasharray?: string | number;
    horizontal?: boolean;
    vertical?: boolean;
    stroke?: string;
    children?: React.ReactNode;
  }

  export const CartesianGrid: React.ComponentType<CartesianGridProps>;
}

declare module 'recharts/lib/component/Tooltip' {
  interface TooltipProps {
    content?: React.ComponentType<any> | React.ReactElement;
    cursor?: boolean | any;
    children?: React.ReactNode;
  }

  export const Tooltip: React.ComponentType<TooltipProps>;
}

declare module 'recharts/lib/component/Legend' {
  interface LegendProps {
    wrapperStyle?: any;
    content?: React.ComponentType<any>;
    children?: React.ReactNode;
  }

  export const Legend: React.ComponentType<LegendProps>;
}

declare module 'recharts/lib/chart/PieChart' {
  import { ReactElement } from 'react';

  interface PieChartProps {
    width?: number;
    height?: number;
    data?: any[];
    children?: ReactElement | ReactElement[];
    className?: string;
  }

  export const PieChart: React.ComponentType<PieChartProps>;
}

declare module 'recharts/lib/polar/Pie' {
  interface PieProps {
    data?: any[];
    dataKey?: string | number | ((obj: any) => any);
    nameKey?: string;
    cx?: string | number;
    cy?: string | number;
    startAngle?: number;
    endAngle?: number;
    innerRadius?: string | number;
    outerRadius?: string | number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    labelLine?: boolean;
    label?: boolean | ((props: { name: any; percent: any }) => string);
    children?: React.ReactNode;
  }

  export const Pie: React.ComponentType<PieProps>;
}

declare module 'recharts/lib/component/Cell' {
  interface CellProps {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    children?: React.ReactNode;
  }

  export const Cell: React.ComponentType<CellProps>;
}
