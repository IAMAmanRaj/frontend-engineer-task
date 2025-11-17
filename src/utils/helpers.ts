
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { tv } from "tailwind-variants"

export const formatDate = (
  dateString: string,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short" }
): string => {
  if (!dateString) {
    console.log("No date string provided")
    return "Invalid Date"
  }
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    console.log(`Invalid date string provided: ${dateString}`)
    return "Invalid Date"
  }

  return new Intl.DateTimeFormat(locale, options).format(date)
}

  export const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    }
    return `₹${price.toLocaleString()}`;
  };

  export const formatArea = (area: number) => {
    return `${area.toLocaleString()} sq.ft`;
  };


export const formatPriceDefault = (amount: number, fullFormat: boolean): string => {
  if (amount === 0) return "0"

  if (amount >= 10000000) {
    const value = parseFloat((amount / 10000000).toFixed(2))
    const suffix =
      value === 1 ? (fullFormat ? "Crore" : "Cr") : fullFormat ? "Crores" : "Cr"
    return `${value} ${suffix}`
  }

  const value = parseFloat((amount / 100000).toFixed(2))
  const suffix =
    value === 1 ? (fullFormat ? "Lakh" : "L") : fullFormat ? "Lakhs" : "L"
  return `${value} ${suffix}`
}

export function concatenateTypologies(input: string[] | number[]) {
  const lastType = input[input.length - 1]
  if (input.length > 1) {
    const otherTypes = input.slice(0, -1)
    let result = otherTypes.join(", ")
    return result + " & " + lastType
  } else {
    return lastType
  }
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Shared color variants
const colorVariants = {
  white: "text-white",
  extralight: "text-[#D5D8E3]",
  dark: "text-[#212130]",
  normal: "text-[#66677E]",
  light: "text-[#A6ACBD]",
  primary: "text-[#FF6D33]",
  primarylight: "text-[#FFF4EF]",
  secondary: "text-[#9A4AFB]",
  tertiary: "text-[#9A4AFB]",
  success: "text-[#47B881]",
  danger: "text-[#F64C4C]",
  warning: "text-[#FFAD0D]",
  info: "text-[#3B95F6]",
}
export const para = tv({
  base: "inline font-regular",
  variants: {
    color: colorVariants,
    size: {
      xs: "text-sm leading-[1.35]",
      sm: "text-sm xl:text-base leading-[1.35]",
      md: "text-sm xl:text-lg leading-[1.35]",
      lg: "text-lg leading-normal",
      xl: "text-xl xl:text-[2rem] leading-normal",
    },
  },
  defaultVariants: {
    size: "md",
  },
})