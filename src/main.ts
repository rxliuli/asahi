import { Chart, ChartConfiguration, registerables } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { zhCN } from 'date-fns/locale'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import './index.css'
dayjs.extend(duration)

Chart.register(...registerables)

interface Data {
  time: string
  value: number
}

const dataset: Data[] = [
  { time: '2018-01', value: 1 },
  { time: '2019-01', value: 2 },
  { time: '2020-01', value: 3 },
  { time: '2021-01', value: 4 },
  { time: '2022-01', value: 5 },
]

function growthRate(first: Data, last: Data) {
  const duration = last.value / first.value
  const year = dayjs
    .duration(dayjs(last.time).diff(dayjs(first.time)))
    .asYears()
  return Math.pow(duration, 1 / year)
}

function getAvg(dataset: Data[]) {
  const last = dataset[dataset.length - 1]
  const first = dataset[0]
  return growthRate(first, last)
}

function convartData(dataset: Data[]) {
  const max = Math.max(...dataset.map((item) => item.value))
  return dataset.map(
    (item) =>
      ({
        time: item.time,
        value: item.value / max,
      } as Data),
  )
}

function main(dataset: Data[]) {
  const avg = getAvg(dataset)

  function calcData(dataset: Data[]) {
    return {
      labels: dataset.map((item) => item.time),
      datasets: [
        {
          label: '实际增长',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: dataset.map((item) => item.value),
        },
        {
          label: '按照平均年增长率',
          backgroundColor: '#ffce56',
          borderColor: '#ffce56',
          data: dataset.map((item) => {
            const first = dataset[0]
            const year = dayjs
              .duration(dayjs(item.time).diff(dayjs(first.time)))
              .asYears()
            return first.value * Math.pow(avg, year)
          }),
        },
      ],
    }
  }

  const data = calcData(dataset)

  const config: ChartConfiguration = {
    type: 'line',
    data: data,
    options: {
      locale: 'zh-CN',
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: {
              quarter: 'YYYY-MM',
            },
          },
          adapters: {
            date: {
              locale: zhCN,
            },
          },
        },
      },
    },
  }

  const chart = new Chart(
    document.getElementById('myChart') as HTMLCanvasElement,
    config,
  )

  function updateData(dataset: Data[]) {
    const data = calcData(dataset)
    chart.data = data
    chart.update()
  }
  Reflect.set(window, 'updateData', updateData)
}

const $textarea = document.querySelector('textarea')!
$textarea.value = JSON.stringify(dataset, null, 2)
document.querySelector('button')?.addEventListener('click', () => {
  const text = $textarea.value
  location.href =
    location.origin +
    '?data=' +
    encodeURIComponent(btoa(JSON.stringify(convartData(JSON.parse(text)))))
})

const obj = new URLSearchParams(location.search)
if (!obj.has('data')) {
  main(dataset)
} else {
  main(JSON.parse(atob(decodeURIComponent(obj.get('data')!))))
}
