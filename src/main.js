/* global fetch */

import React from 'react'
import ReactDOM from 'react-dom'
import moment from 'moment'

const el = document.getElementById('weather-widget')

class WeatherWidget extends React.Component {
  constructor (props) {
    super(props)
    this.state = {loading: true}
  }

  componentDidMount () {
    this.fetchWeatherData()
  }

  fetchWeatherData () {
    fetch(el.getAttribute('data-url'))
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
                temperature: `${weatherdata.observations[0].weatherstation[0].temperature[0].$.value}°C`,
                symbol: weatherdata.observations[0].weatherstation[0].symbol[0].$.name,
                time: new Date(weatherdata.meta[0].lastupdate[0]),
                sun: {
                  rise,
                  set,
                  hours: Math.round((set.getTime() - rise.getTime()) / 1000 / 60 / 60)
                },
                forecast: weatherdata.forecast[0].tabular[0].time.map(f => ({
                  from: new Date(f.$.from),
                  to: new Date(f.$.to),
                  symbol: f.symbol[0].$.name,
                  precipitation: f.precipitation[0].$,
                  temperature: f.temperature[0].$.value
                }))
              }
            })
          })
      })
  }

  render () {
    if (this.state.loading) return <div className='message'><p>Loading …</p></div>
    if (this.state.error) return <div className='message error'><p>Failed to load data.</p></div>

    const {temperature, symbol, time, sun, forecast} = this.state.data

    return <div className='widget'>
      <div className='temp'>{temperature}</div>
      <div className={`symbol ${symbol}`}>{symbol}</div>
      <dl className='sun'>
        <dt>Sunrise</dt>
        <dd>
          <time dateTime={sun.rise.toISOString()}>{moment(sun.rise).format('h:mm')}</time>
        </dd>
        <dt>Sunset</dt>
        <dd>
          <time className='time' dateTime={sun.set.toISOString()}>{moment(sun.set).format('h:mm')}</time>
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
      <Forecast forecast={forecast} />
    </div>
  }
}

const Forecast = props => {
  const rows = props.forecast.map(f => <tr key={f.from}>
    <td>
      <time className='from' dateTime={f.from.toISOString()}>{moment(f.from).format('D.MM. hh:mm')}</time>
    </td>
    <td>
      {f.temperature}
    </td>
    <td>
      {f.symbol}
    </td>
    <td>
      {f.precipitation.minvalue}&ndash;{f.precipitation.maxvalue}
    </td>
  </tr>)
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
