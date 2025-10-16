import { ConfirmToastProps } from "@/lib/types";
import { BadgeQuestionMark } from "lucide-react";

const ConfirmToast = ({
  closeToast = () => {},
  onConfirm,
  onCancel,
  icon,
  title,
  subTitle,
  primaryButton,
  secondaryButton,
  color,
}: ConfirmToastProps) => (
  <div>
    <div className="flex">
      <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 text-${color}-500 bg-blue-100 rounded-lg`}>
        {icon ? icon : <BadgeQuestionMark size={16} />}
        <span className="sr-only">Save icon</span>
      </div>
      <div className="ms-3 text-sm font-normal">
        <span className="mb-1 text-sm font-medium text-gray-900">
          {title ? title : ''}
        </span>
        <div className="mb-2 text-sm font-normal">
         {subTitle ? subTitle : ''}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <a
              href="#"
              onClick={() => {
                onConfirm();
                closeToast();
              }}
              className={`inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-${color}-600 rounded-lg focus:ring-4 focus:outline-none focus:ring-blue-300`}
            >
              {primaryButton ? primaryButton : ''}
            </a>
          </div>
          <div>
            <a
              href="#"
              onClick={() => {
                onCancel();
                closeToast();
              }}
              className="inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg "
            >
              {secondaryButton ? secondaryButton : ''}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ConfirmToast;