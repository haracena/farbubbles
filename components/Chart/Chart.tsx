import { AreaSeries, ColorType, createChart } from 'lightweight-charts'
import React, { useEffect, useRef } from 'react'

export interface ChartColors {
  backgroundColor?: string
  lineColor?: string
  textColor?: string
  areaTopColor?: string
  areaBottomColor?: string
  gridLineColor?: string
  axisTextColor?: string
  priceScaleTextColor?: string
}

export interface ChartProps {
  data: { time: string; value: number }[]
  colors?: ChartColors
}

const DEFAULT_COLORS: Required<ChartColors> = {
  backgroundColor: 'transparent',
  lineColor: '#2962FF',
  textColor: '#e5e7eb',
  areaTopColor: '#2962FF',
  areaBottomColor: 'rgba(41, 98, 255, 0.28)',
  gridLineColor: 'rgba(214, 219, 231, 0.25)',
  axisTextColor: '#e5e7eb',
  priceScaleTextColor: '#cbd5f5',
}

export default function Chart({ data, colors }: ChartProps) {
  const {
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
    gridLineColor,
    axisTextColor,
    priceScaleTextColor,
  } = { ...DEFAULT_COLORS, ...colors }

  const chartContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const chart = createChart(chartContainerRef.current || '', {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor: axisTextColor ?? textColor,
      },
      grid: {
        vertLines: { color: gridLineColor },
        horzLines: { color: gridLineColor },
      },
      timeScale: {
        borderColor: gridLineColor,
      },
      rightPriceScale: {
        borderColor: gridLineColor,
        textColor: priceScaleTextColor,
      },
      width: chartContainerRef.current?.clientWidth || 0,
      height: 200,
    })

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current?.clientWidth || 0,
      })
    }

    chart.timeScale().fitContent()

    const newSeries = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: areaTopColor,
      bottomColor: areaBottomColor,
    })
    newSeries.setData(data)

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      chart.remove()
    }
  }, [
    data,
    backgroundColor,
    lineColor,
    textColor,
    areaTopColor,
    areaBottomColor,
    gridLineColor,
    axisTextColor,
    priceScaleTextColor,
  ])

  return <div ref={chartContainerRef} />
}
