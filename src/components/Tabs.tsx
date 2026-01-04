import { useState, Children, cloneElement, isValidElement } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface TabProps {
  label: string;
  children: ReactNode;
  icon?: ReactElement;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: ReactElement<TabProps> | ReactElement<TabProps>[];
}

export function Tabs({ children }: TabsProps) {
  const tabs = Children.toArray(children).filter(
    isValidElement
  ) as ReactElement<TabProps>[];
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab, index) => (
          <button
            key={tab.props.label}
            onClick={() => setActiveIndex(index)}
            className={`relative flex-1 py-3 px-2 text-sm sm:text-base font-medium text-center transition-colors focus:outline-none whitespace-nowrap ${
              activeIndex === index
                ? 'text-green-600'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {tab.props.icon &&
                cloneElement(tab.props.icon, { size: 18 } as any)}
              <span>{tab.props.label}</span>
            </div>
            {activeIndex === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">{tabs[activeIndex]}</div>
    </div>
  );
}
