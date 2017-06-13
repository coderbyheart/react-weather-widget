/* global fetch URL */

import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'

const el = document.getElementById('weather-widget')

const timeThere = (offset, d = new Date()) => {
  const utc = d.getTime() + (d.getTimezoneOffset() * 60 * 1000)
  return new Date(utc + (offset * 60 * 1000))
}

const getIcon = (time, symbol, {rise, set}) => {
  const sunRise = new Date(time.getTime())
  sunRise.setHours(rise.getHours())
  const sunSet = new Date(time.getTime())
  sunSet.setHours(set.getHours())

  const isDay = time > sunRise.getTime() && time < sunSet.getTime()
  const isNight = !isDay
  const isMorketid = isNight && sunRise.getHours() >= 9 && sunSet.getHours() <= 17 // vi viser den halve sola når det er midt på dagen (mellom kl 09 og 17) og sola IKKE er oppe. http://om.yr.no/symbol/morketid/
  let icon = ('0' + symbol).substr(-2)
  if (!['04', '09', '10', '11', '12', '13', '14', '15', '22', '23', '30', '31', '32', '33', '34', '46', '47', '48', '49', '50'].includes(icon)) {
    icon += isMorketid ? 'm' : (isDay ? 'd' : 'n')
  }
  return icon
}

class WeatherWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {loading: true, forecastVisible: false, images: el.getAttribute('data-images') || './icon'}
  }

  componentDidMount () {
    this.fetchWeatherData()
  }

  fetchWeatherData () {
    const url = new URL(el.getAttribute('data-url'), window.location.href)
    url.searchParams.append('v', Math.floor(Date.now() / 1000 / 60))
    fetch(url)
      .then(response => {
        if (!response.ok) return this.setState({loading: false, error: true})
        response.json()
          .then(json => {
            const weatherdata = json.weatherdata
            const rise = new Date(weatherdata.sun[0].$.rise)
            const set = new Date(weatherdata.sun[0].$.set)
            this.setState({
              loading: false,
              data: {
                location: {
                  name: weatherdata.location[0].name[0],
                  type: weatherdata.location[0].type[0],
                  country: weatherdata.location[0].country[0],
                  timezone: {
                    name: weatherdata.location[0].timezone[0].$.id,
                    offset: +weatherdata.location[0].timezone[0].$.utcoffsetMinutes
                  }
                },
                temperature: {
                  value: weatherdata.observations[0].weatherstation[0].temperature[0].$.value,
                  time: weatherdata.observations[0].weatherstation[0].temperature[0].$.time
                },
                symbol: {
                  name: weatherdata.observations[0].weatherstation[0].symbol[0].$.name,
                  number: weatherdata.observations[0].weatherstation[0].symbol[0].$.number
                },
                time: new Date(weatherdata.meta[0].lastupdate[0]),
                sun: {
                  rise,
                  set,
                  hours: Math.round((set.getTime() - rise.getTime()) / 1000 / 60 / 60)
                },
                forecast: weatherdata.forecast[0].tabular[0].time.map(f => ({
                  from: new Date(f.$.from),
                  to: new Date(f.$.to),
                  symbol: {
                    name: f.symbol[0].$.name,
                    number: f.symbol[0].$.numberEx
                  },
                  precipitation: f.precipitation[0].$,
                  temperature: f.temperature[0].$.value
                })),
                credit: {
                  text: weatherdata.credit[0].link[0].$.text,
                  url: weatherdata.credit[0].link[0].$.url
                }

              }
            })
          })
      })
  }

  render () {
    if (this.state.loading) return <div className='message'><p>Loading …</p></div>
    if (this.state.error) return <div className='message error'><p>Failed to load data.</p></div>

    const {temperature, symbol, time, sun, forecast, location, credit} = this.state.data

    const icon = getIcon(timeThere(location.timezone.offset, new Date(temperature.value)), symbol.number, sun)
    const iconSrc = `${this.state.images}/${icon}.png`

    const toggleForecast = () => this.setState({forecastVisible: !this.state.forecastVisible})

    return <div className='widget'>
      <div className='temp'>{temperature.value}°C</div>
      <div className={`symbol ${symbol.name}`}>
        <img src={iconSrc} alt={symbol.name} className='icon' />
      </div>
      <dl className='sun'>
        <dt>Sunrise</dt>
        <dd>
          <time dateTime={sun.rise.toISOString()}>{moment(sun.rise).format('HH:mm')}</time>
        </dd>
        <dt>Sunset</dt>
        <dd>
          <time className='time' dateTime={sun.set.toISOString()}>{moment(sun.set).format('HH:mm')}</time>
        </dd>
        <dt>Hours</dt>
        <dd>{sun.hours}</dd>
      </dl>
      <dl className='updated'>
        <dt>Updated</dt>
        <dd>
          <time className='time' dateTime={time.toISOString()}>{moment(time).fromNow()}</time>
        </dd>
      </dl>
      <button
        type='button'
        onClick={toggleForecast}>{(this.state.forecastVisible ? 'hide forecast' : 'show forecast')}</button>
      {(this.state.forecastVisible
          ? <Forecast forecast={forecast} tzOffset={location.timezone.offset} sun={sun} images={this.state.images} />
          : ''
      )}
      <div className='credit'>
        <span>Source:</span> <a href={credit.url} target='_blank'>{credit.text}</a>
      </div>
    </div>
  }
}

const Forecast = ({forecast, tzOffset, sun, images}) => {
  const rows = forecast.map(f => {
    const icon = getIcon(timeThere(tzOffset, f.from), f.symbol.number, sun)
    const iconSrc = `${images}/${icon}.png`

    return <tr key={f.from}>
      <td>
        <time className='from' dateTime={f.from.toISOString()}>{moment(f.from).format('D.MM. HH:mm')}</time>
      </td>
      <td>
        {f.temperature}°C
      </td>
      <td>
        <img src={iconSrc} alt={f.symbol.name} className='icon' />
      </td>
      <td>
        {f.precipitation.minvalue}&ndash;{f.precipitation.maxvalue}
      </td>
    </tr>
  })
  return <table className='forecast'>
    <thead>
      <tr>
        <th>Time</th>
        <th>Temperature</th>
        <th>Weather</th>
        <th>Precipitation</th>
      </tr>
    </thead>
    <tbody>
      {rows}
    </tbody>
  </table>
}

ReactDOM.render(
  <WeatherWidget />,
  el
)
