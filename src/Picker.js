import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import 'whatwg-fetch'
import InfiniteScroll from 'react-infinite-scroller';

function debounce(fn, delay) {
	var timer = null;
	return function () {
		var context = this, args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			fn.apply(context, args);
		}, delay);
	};
}

export default class extends Component {

	constructor (props) {
		super(props)
		this.state = {
			gifs: [],
			searchValue: '',
			loading: true,
			giphySearchUrl: `https://api.giphy.com/v1/gifs/search?api_key=${this.props.apiKey}`,
			giphyTrendingUrl: `https://api.giphy.com/v1/gifs/trending?api_key=${this.props.apiKey}`,
			page: 0
		}

		this.searchGifs = debounce(this.searchGifs, 500)
		this.loadTrendingGifs()
	}

	static get propTypes () {
		return {
			onSelected: PropTypes.func.isRequired,
			visible: PropTypes.bool,
			modal: PropTypes.bool,
			apiKey: PropTypes.string,
			loader: PropTypes.element,
			placeholder: PropTypes.string,
			className: PropTypes.string,
			inputClassName: PropTypes.string,
			gifClassName: PropTypes.string,
			children: PropTypes.element
		}
	}

	static get defaultProps () {
		return {
			visible: true,
			modal: false,
			apiKey: "dc6zaTOxFJmzC",
			placeholder: "Search for GIFs",
			loader: (<p>Loading...</p>)
		}
	}

	loadTrendingGifs (offset) {
		const {giphyTrendingUrl, page} = this.state

		let url = giphyTrendingUrl
		if (offset) {
			url += '&offset=' + offset
		}

		fetch(url, {
			method: 'get'
		}).then((response) => {
			return response.json()
		}).then((response) => {
			let gifs = response.data.map((g, i) => {return g.images})
			this.setState({
				gifs: this.state.gifs.concat(gifs),
				page: page + 1,
				loading: false
			})
		})
	}

	searchGifs (offset) {
		const {giphySearchUrl, searchValue, page} = this.state
		if (searchValue.length < 1) { return }

		let url = giphySearchUrl + '&q=' + searchValue.replace(' ', '+')
		if (offset) {
			url += '&offset=' + offset
		}

		this.setState({
			loading: true
		})
		fetch(url, {
			method: 'get'
		}).then((response) => {
			return response.json()
		}).then((response) => {
			let gifs = response.data.map((g, i) => {return g.images})
			this.setState({
				gifs: this.state.gifs.concat(gifs),
				page: page + 1,
				loading: false
			})
		})
	}

	onGiphySelect (gif) {
		this.props.onSelected(gif)
	}

	onSearchChange (event) {
		event.stopPropagation()
		this.setState({
			searchValue: event.target.value,
			page: -1,
			gifs: []
		}, () => this.searchGifs())
	}

	onKeyDown (event) {
		if (event.key === 'Escape') {
			event.preventDefault()
			this.reset()
		}
	}

	reset () {
		this.setState({searchValue: ''})
	}

	loadMore = () => {
		const {loading, searchValue, page} = this.state
		let nextPage = page + 1
		console.log("loadmore", nextPage)
		if (loading) {
			return
		}
		if (searchValue) {
			this.searchGifs(Number(nextPage) * 20)
		} else {
			this.loadTrendingGifs(Number(nextPage) * 20)
		}
	}

	render() {
		const {gifs, loading} = this.state
		const {visible, modal} = this.props
		return (
			<Wrapper className={this.props.className}>
				<GiphyPickerWrapper visible={visible} modal={modal}>
					<Input
						name='giphy-search'
						type="text"
						className={this.props.inputClassName}
						autoCapitalize="none"
						autoComplete="off"
						autoCorrect="off"
						onChange={::this.onSearchChange}
						value={this.state.searchValue}
						onKeyDown={::this.onKeyDown}
						placeholder={this.props.placeholder} />
					<GiphyWrapper>
						<InfiniteScroll
							loadMore={this.loadMore}
							hasMore={!loading}
							// loader={this.props.loader}
							initialLoad={false}
							useWindow={false}
						>
							{
								gifs.map((g, i) => {
									let gifUrl = g.fixed_width.url
									return (
										<Giphy
											key={i}
											className={this.props.gifClassName}
											src={gifUrl}
											onClick={() => {this.onGiphySelect(g)}} />
									)
								})
							}
						</InfiniteScroll>
					</GiphyWrapper>
				</GiphyPickerWrapper>
				{this.props.children}
			</Wrapper>
		)
	}
}

const Wrapper = styled.div`
  position: relative;
`

const GiphyPickerWrapper = styled.div`
  position: ${props => props.modal ? 'absolute' : 'static'};
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 200ms linear;
  margin-top: 1rem;
  border: 1px solid #F1F1F1;
  border-radius: 2px;
  background: white;
  box-shadow: 3px 3px 5px #BFBDBD;
  width: 232px;
  height: 400px;
  z-index: 100;
  padding-top: 0.5rem;
`

const GiphyWrapper = styled.div`
  padding-right: 0;
  border-radius: 2px;
  overflow-y: scroll;
  height: 362px;
  margin-top: 0.2rem;
`

const Giphy = styled.img`
  cursor: pointer;
  margin: 0 auto;
  display: block;
  margin-top: 5px;
  border-radius: 3px;
`

const Input = styled.input`
  background-color: transparent;
  border: 1px solid #ddd;
  border-radius: 2px;
  color: inherit;
  font-size: 14px;
  height: auto;
  line-height: 1;
  margin: 0;
  padding: 7px 10px;
  width: 94%;
  margin: 0 auto;
  display: block;
  &:focus {
    outline: none;
  }
`
