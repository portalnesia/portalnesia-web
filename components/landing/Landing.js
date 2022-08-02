import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import useSWR from 'portal/utils/swr'
import useAPI from 'portal/utils/api'
import {CircularProgress} from '@mui/material'
import {connect} from 'react-redux';
import {specialHTML} from '@portalnesia/utils'
import loadingImage from 'portal/components/header/loading-image-base64'
/*
<script key='bs' src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js" integrity="sha384-6khuMg9gaYr5AxOqhkVIODVIvm9ynTT5J4V1cfthmT+emCG6yVmEZsRHdxlotUnm" crossOrigin="anonymous"></script>
<script key='jq-scroll' src={`${process.env.CONTENT_URL}/css/home/assets/js/scrolling-nav-min.js`}></script>
<script key='jq-modern' src={`${process.env.CONTENT_URL}/css/home/assets/js/vendor/modernizr-3.6.0.min-min.js`}></script>
<script key='jquery' src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script key='jquery-ui' src="https://cdn.jsdelivr.net/npm/jquery-ui-dist@1.12.1/jquery-ui.min.js" integrity="sha256-KM512VNnjElC30ehFwehXjx1YCHPiQkOPmqnrWtpccM=" crossOrigin="anonymous"></script>
<script key='jq-easy' src={`${process.env.CONTENT_URL}/css/home/assets/js/jquery.easing.min-min.js`}></script>
<script key='jq-imgload' src={`${process.env.CONTENT_URL}/css/home/assets/js/imagesloaded.pkgd.min-min.js`}></script>
<script key='jq-magni' src={`${process.env.CONTENT_URL}/css/home/assets/js/jquery.magnific-popup.min-min.js`}></script>
<script key='jq-extra' src={`${process.env.CONTENT_URL}/js/extra.js`}></script>
*/
//let srcc=false;
let intrval=null;
const Landing=({dispatch})=>{
    const dayjs=require('dayjs')
    const {data}=useSWR(`/v1/internal/home`);
    const [loaded,setLoaded]=React.useState(false);
    const [isCollapse,setIsCollapse]=React.useState(true)
    const [isActive,setActive]=React.useState(false)

    const handleCollapse=()=>{
        setActive(isCollapse)
        setIsCollapse(!isCollapse)
    }

    const handleBackToTop=(e)=>{
        e.preventDefault()
        window?.scrollTo({top:0,left:0,behavior:'smooth'});
    }

    const handleClickLink=(id)=>(e)=>{
        e.preventDefault()
        setIsCollapse(true)
        setActive(false)
        const conta=document.getElementById(id);
        if(conta){
            const a=conta.offsetTop,b=a-50;
            window.scrollTo({top:b,left:0,behavior:'smooth'});
        }
    }

    React.useEffect(()=>{
        setTimeout(()=>setLoaded(true),500)

        return ()=>{
            if(intrval!==null) clearInterval(intrval)
        }
    },[])

    React.useEffect(()=>{
        const $=require('jquery');
        const WOW = require('wowjs');
        const woww = new WOW.WOW();
        require('jquery.easing')
        require('@fancyapps/fancybox');
        require('portal/utils/lazysizes');
        if(data) {
            //srcc=true;
            $('[data-fancybox]').fancybox({
                protect: true,
                hash: false,
                mobile:{
                    clickSlide: function(current, event) {
                        return "close";
                    }
                },
            });
            
            $(document).ready(function(){
                "use strict";
                woww.init();
                $("img,#chart,map,area").contextmenu(function(n){
                    n.preventDefault()
                });
                $("video").bind("contextmenu",function(n){
                    return!1
                });
                $("img,map,area").on("dragstart",function(n){
                    n.preventDefault()
                });

                //$(".preloader").fadeOut(500);
                
                /*$(".navbar-toggler").on("click",function(){
                    $(this).toggleClass("active")
                });

                $(".navbar-nav a").on("click",function(){
                    $(".navbar-toggler").removeClass("active")
                })*/

                const aaaa=$(".page-scroll:not(.eks-link)");
                $(window).on("scroll",function(a){
                    $(window).scrollTop()<10?($(".header-pengumuman").removeClass("sticky"),$(".navbar-area").removeClass("sticky")):($(".header-pengumuman").addClass("sticky"),$(".navbar-area").addClass("sticky"))
                    $(window).scrollTop()>600?$(".back-to-top").fadeIn(200):$(".back-to-top").fadeOut(200)
                    var o=$(this).scrollTop();
                    aaaa.each(function(){
                        $(this.hash).offset().top-73<=o&&($(this).parent().addClass("active"),$(this).parent().siblings().removeClass("active"))
                    })
                });
                $(".back-to-top").on("click",function(a){
                    a.preventDefault();
                    $("html, body").animate({scrollTop:0},1500);
                })
            });
        }
        return()=>{
            $(window).off('scroll')
        }
    },[data])

    return(
        <div>
            <Head>
                <link key='css-bootstrap' href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossOrigin="anonymous" />
                <link key='css-icon' rel="stylesheet" href={`${process.env.CONTENT_URL}/css/home/assets/css/LineIconss.css`} />
                <link key='css-animate' rel="stylesheet" href={`${process.env.CONTENT_URL}/css/animate.css`} />
                <link key='css-default' rel="stylesheet" href={`${process.env.CONTENT_URL}/css/home/assets/css/default.css`} />
                <link key='css-extra' rel="stylesheet" href={`${process.env.CONTENT_URL}/css/extras.css`} />
                <link key='css-style' rel="stylesheet" href={`${process.env.CONTENT_URL}/css/home/assets/css/style.css`} />
                <style dangerouslySetInnerHTML={{__html:`.navbar-area .navbar .navbar-toggler .toggler-icon{background-color:#ffffff}
                    div.action-btn.rounded-buttons button.main-btn.rounded-three{line-height:50px!important;}.KL-alert{padding:.75rem 2.5rem;display:flex}.KL-alert i{position:absolute;padding:.8rem .5rem;top:0!important;left:3px;font-size:18px;color:#ffffff;}.promo-popup.hidden{left:24px;}@media(max-width:450px){.promo-popup{left:10px;right:unset;}.promo-popup.hidden{left:10px!important;right:unset!important;}}@media(min-width:451px){.promo-popup{left:24px;}}.header-pengumuman{z-index:999;position:sticky;width:100%}@media(min-width:991px){.header-pengumuman{top:94px}.header-pengumuman.sticky{top:84px}}@media(max-width:990px){.header-pengumuman{top:69.06px}.header-pengumuman.sticky{top:59.06px}}`}}></style>
            </Head>
            {!loaded && (
                <div style={{position:'fixed',height:'100%',width:'100%',background:'#2f6f4e',zIndex:5000}}>
                    <img style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} onContextMenu={(e)=>e.preventDefault()} className='load-child no-drag' alt='Portalnesia' src={loadingImage} />
                </div>
            )}
            <div {...(!loaded ? {style:{display:'none'}} : {})}>
                <section key={0} className="header-area">
                    <div className="navbar-area" style={{backgroundColor:'#242526'}}>
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-12">
                                    <nav className="navbar navbar-expand-lg">
                                        <a className="navbar-brand" href="/">
                                            <img src={`${process.env.CONTENT_URL}/Banner.png`} alt="Portalnesia" title="Portalnesia" />
                                        </a>

                                        <button id='navbarToggler' className={`navbar-toggler ${isActive ? 'active':''}`} type="button" data-toggle="collapse" data-target="#navbarEight" aria-controls="navbarEight" aria-label="Toggle navigation" aria-expanded={!isCollapse ? true:false} onClick={handleCollapse}>
                                            <span className="toggler-icon"></span>
                                            <span className="toggler-icon"></span>
                                            <span className="toggler-icon"></span>
                                        </button>
                                                <div className={`${isCollapse ? 'collapse':''} navbar-collapse sub-menu-bar`} id="navbarEight">
                                                    <ul className="navbar-nav ml-auto">
                                                        <li className="nav-item">
                                                            <a className="page-scroll" href="#about" onClick={handleClickLink("about")}>ABOUT</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a className="page-scroll" href="#news" onClick={handleClickLink("news")}>NEWS</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a className="page-scroll" href="#chord" onClick={handleClickLink("chord")}>CHORD</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a className="page-scroll" href="#twibbon" onClick={handleClickLink("twibbon")}>TWIBBON</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a className="page-scroll" href="#thread" onClick={handleClickLink("thread")}>THREAD</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a className="page-scroll" href="#contact" onClick={handleClickLink("contact")}>CONTACT</a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a className="page-scroll ml-sm-2 eks-link" style={{backgroundColor:'#2f6f4e',color:'#ffffff'}} href={`${process.env.ACCOUNT_URL}/login`}>LOGIN</a>
                                                        </li>
                                                    </ul>
                                                </div>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={1} id="about" className="about-area">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-8">
                                <div className="about-image text-center wow fadeInUp" data-wow-duration="1.5s" data-wow-offset="100">
                                    <img src={`${process.env.CONTENT_URL}/css/home/assets/images/services.png`} alt="services" />
                                </div>
                                <div className="section-title text-center mt-30 pb-40">
                                    <h4 className="title wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.3s">The future platform</h4>
                                    <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">A multi-functional website to accompany you to surf the internet. Sign up to get more features.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><a className="page-scroll" href="#news">News</a></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">A collection of news that is updated every day.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><a className="page-scroll" href="#chord">Chord</a></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">A collection of guitar chords with transpose tools, auto scroll, font sizer, and print features that make it easy to learn guitar.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><a className="page-scroll" href="#urlShortener">URL Shortener</a></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Shorten your long URLs so that it's easy to share with others.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><a className="page-scroll" href="#thread">Twitter Thread Reader</a></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Read threads from Twitter easily.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><a className="page-scroll" href="#twibbon">Twibbon</a></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Create your own twibbon or edit your photo to twibbon that is already available and share it easily.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><Link href='/geodata/transform'><a>Transform Coordinate</a></Link></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Insert value pairs of geographic coordinates and transform them to different coordinate system or cartographic projection.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><Link href='/twitter/docs'><a>Twitter Menfess</a></Link></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Send a message or just the words you want to convey to "someone" as anonymous without notifying the sender's identity.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><Link href='/quiz'><a>Quiz</a></Link></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Create your own quiz and share with friends or answer a few quizzes.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><Link href='/parse-html'><a>Parse HTML</a></Link></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Parse your HTML code into XML code compatible with all the Blogger templates or other blogs systems.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><Link href='/blog'><a>Blog</a></Link></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Turn your thoughts into writing and share it easily.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><Link href='/images-checker'><a>Images Checker</a></Link></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Online tools to help you quickly identify unseemly images.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="single-about d-sm-flex mt-30 wow fadeInUp" data-wow-duration="1s" data-wow-delay="0.5s">
                                    <div className="about-content media-body">
                                        <h4 className="about-title"><a className="page-scroll" href="#footer">Others</a></h4>
                                        <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">And some other services that are definitely useful</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={2} className="call-action-area call-action-2">
                    <div className="container">
                        <div className="row align-items-center wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                            <div className="col-lg-5">
                                <div className="call-action-content mt-45">
                                    <h3 className="action-title">Search Something...</h3>
                                    <p className="text">Explore our contents</p>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="call-action-form mt-30">
                                    <form action="/search" method="GET">
                                        <input type="text" name="q" placeholder="Search..." />
                                        <div className="action-btn rounded-buttons"><button className="main-btn rounded-three">search</button></div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={3} id="news" className="portfolio-area">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div className="section-title text-center pb-20 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                                    <h3 className="title">Recent News</h3>
                                    <p className="text"></p>
                                </div>
                            </div>
                        </div>
                        <div className="row grid">
                            {!data ? (
                                <div style={{display:'flex',justifyContent:'center',justifyItems:'center'}}>
                                    <CircularProgress thickness={5} size={50} />
                                </div>
                            ) : data?.news?.map((n,i)=>(
                                <div key={`news-${i}`} className="col-lg-4 col-sm-6">
                                    <div className="single-portfolio mt-30 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.3s">
                                        <div className="portfolio-image">
                                            <picture>
                                                <source type="image/webp" srcSet={`${process.env.CONTENT_URL}/img/url?size=500&export=twibbon&watermark=no&output=webp&image=${decodeURIComponent(n?.image)}`} />
                                                <source type="image/jpeg" srcSet={`${process.env.CONTENT_URL}/img/url?size=500&export=twibbon&watermark=no&image=${decodeURIComponent(n?.image)}`} />
                                                <img className='no-drag' onContextMenu={(e)=>e.preventDefault()} src={`${process.env.CONTENT_URL}/img/url?size=500&export=twibbon&watermark=noimage=${decodeURIComponent(n?.image)}`} alt={n?.title} />
                                            </picture>
                                            <div className="portfolio-overlay d-flex align-items-center justify-content-center">
                                                <div className="portfolio-content">
                                                    <div className="portfolio-icon">
                                                        <a className="image-popup" data-src={n?.image} data-fancybox="News" data-options='{"protect" : "true" }'><i className="lni lni-zoom-in"></i></a>
                                                    </div>
                                                    <div className="portfolio-icon">
                                                        <Link href='/news/[...slug]' as={n?.link} passHref><a><i className="lni lni-link"></i></a></Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="portfolio-text">
                                            <h4 className="portfolio-title"><Link href='/news/[...slug]' as={n?.link} passHref><a>{n?.title}</a></Link></h4>
                                            <p className="text">{specialHTML(n?.text)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))} 
                        </div>
                        <div className="row mt-2 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">
                            <div className="col-12">
                                <div className="form-input rounded-buttons mt-20 text-center">
                                    <Link href='/news' passHref><a className="main-btn rounded-three">See More</a></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={4} id="chord" className="pricing-area">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div className="section-title text-center pb-20 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                                    <h3 className="title">Recent Chord</h3>
                                    <p className="text"></p>
                                </div>
                            </div>
                        </div>
                        <div className="row grid">
                            {!data ? (
                                <div style={{display:'flex',justifyContent:'center',justifyItems:'center'}}>
                                    <CircularProgress thickness={5} size={50} />
                                </div>
                            ) : data?.chord?.map((c,i)=>(
                                <div key={`chord-${i}`} className="col-lg-4 col-sm-6">
                                    <div className="single-portfolio mt-30 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.3s">
                                        <div className="portfolio-text">
                                            <h4 className="portfolio-title"><Link href={`/chord/${c?.slug}`} passHref><a>{c?.artist} - {c?.title}</a></Link></h4>
                                            <p className="text">{c?.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row mt-2 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">
                            <div className="col-12">
                                <div className="form-input rounded-buttons mt-20 text-center">
                                    <Link href="/chord" passHref><a className="main-btn rounded-three">See More</a></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={5} id="twibbon" className="portfolio-area">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div className="section-title text-center pb-20 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                                    <h3 className="title">Recent Twibbon</h3>
                                    <p className="text"></p>
                                </div>
                            </div>
                        </div>
                        <div className="row grid">
                            {!data ? (
                                <div style={{display:'flex',justifyContent:'center',justifyItems:'center'}}>
                                    <CircularProgress thickness={5} size={50} />
                                </div>
                            ) : data?.twibbon?.map((t,i)=>(
                                <div key={`twibbon-${i}`} className="col-lg-6 col-sm-6">
                                    <div className="single-portfolio mt-30 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.3s">
                                        <div className="portfolio-image">
                                            <img onContextMenu={(e)=>e.preventDefault()} className="no-drag lazyload" data-src={`${process.env.CONTENT_URL}/img/twibbon/${t?.slug}?size=200`} alt={t?.title} />
                                            <div className="portfolio-overlay d-flex align-items-center justify-content-center">
                                                <div className="portfolio-content">
                                                    <div className="portfolio-icon">
                                                        <a className="image-popup" data-src={`${process.env.CONTENT_URL}/img/twibbon/${t?.slug}`} data-fancybox="Twibbon" data-options='{"protect" : "true" }'><i className="lni lni-zoom-in"></i></a>
                                                    </div>
                                                    <div className="portfolio-icon">
                                                        <Link href={`/twibbon/${t?.slug}`} passHref><a><i className="lni lni-link"></i></a></Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="portfolio-text">
                                            <h4 className="portfolio-title"><Link href={`/twibbon/${t?.slug}`} passHref><a>{t?.title}</a></Link></h4>
                                            <p className="text">{t?.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row mt-2 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">
                            <div className="col-12">
                                <div className="form-input rounded-buttons mt-20 text-center">
                                    <Link href='/twibbon' passHref><a href="<?=Main::href('twibbon');?>" className="main-btn rounded-three">See More</a></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={6} id="thread" className="pricing-area call-action-2">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div className="section-title text-center pb-20 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                                    <h3 className="title">Recent Twitter Thread</h3>
                                    <p className="text"></p>
                                </div>
                            </div>
                        </div>
                        <div className="row grid">
                            {!data ? (
                                <div style={{display:'flex',justifyContent:'center',justifyItems:'center'}}>
                                    <CircularProgress thickness={5} size={50} />
                                </div>
                            ) : data?.thread?.map((t,i)=>(
                                <div key={`thread-${i}`} className="col-lg-4 col-sm-6">
                                    <div className="single-portfolio mt-30 wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.3s">
                                        <div className="portfolio-text">
                                            <h4 className="portfolio-title"><Link href={`/twitter/thread/${t?.id}`} passHref><a>Threads by @{t?.screen_name}</a></Link></h4>
                                            <p className="text">{specialHTML(t?.title?.replace(`Threads by @${t?.screen_name}: `,""))}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="row mt-2 wow fadeInUp pb-3" data-wow-duration="1.5s" data-wow-delay="0.6s">
                            <div className="col-12">
                                <div className="form-input rounded-buttons mt-20 text-center">
                                    <Link href='/twitter/thread' passHref><a className="main-btn rounded-three">See More</a></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={12} className="call-action-area call-action-2">
                    <div className="container">
                        <div className="row align-items-center wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                        <div className="col-lg-5">
                            <div className="call-action-content mt-15">
                                <h3 className="action-title">Read Twitter Thread</h3>
                                <p className="text">Read threads from Twitter easily.</p>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="call-action-form mt-30">
                                <form action="/twitter/thread" method="GET">
                                    <input name="url" placeholder="Enter Twitter Thread URL" />
                                    <div className="action-btn rounded-buttons">
                                        <button className="main-btn rounded-three">Read</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        </div>
                    </div>
                </section>

                <section key={7} id="urlShortener" className="call-action-area">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-xl-6 col-lg-8">
                                <div className="section-title text-center mt-30 pb-40">
                                    <h4 className="title wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.3s">Shorten URL</h4>
                                    <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Shorten your long URL so it's easy to read and share</p>
                                </div>
                            </div>
                        </div>
                        <div className="row align-items-center wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                            <div className="col-lg-12">
                                <div className="call-action-form mt-30">
                                    <form action="/url" method="GET">
                                        <input name="url" placeholder="Enter your long URL" />
                                        <div className="action-btn rounded-buttons">
                                            <button className="main-btn rounded-three">Shorten</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={8} id="contact" className="contact-area">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-6">
                                <div className="section-title text-center pb-20">
                                    <h3 className="title wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">Contact</h3>
                                    <p className="text wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">Have questions, criticisms, suggestions?</p>
                                </div>
                            </div>
                        </div>
                        <div className="row wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.6s">
                            <div className="col-12">
                                <div className="form-input rounded-buttons mt-20 text-center">
                                    <Link href="/contact" passHref><a className="main-btn rounded-three">Contact</a></Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section key={9} id="call-action" className="call-action-area">
                    <div className="container">
                        <div className="row align-items-center wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.2s">
                            <div className="col-lg-5">
                                <div className="call-action-content mt-45">
                                    <h3 className="action-title">Register Now!</h3>
                                    <p className="text"></p>
                                </div>
                            </div>
                            <div className="col-lg-7">
                                <div className="call-action-form mt-30">
                                    <form action={`${process.env.ACCOUNT_URL}/register`} method="POST" target="_blank">
                                        <input type="email" name="email_push" placeholder="Enter your email" />
                                        <div className="action-btn rounded-buttons">
                                            <button className="main-btn rounded-three">register</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <footer id="footer" className="footer-area">
                    <div className="footer-widget">
                        <div className="container">
                            <div className="row wow fadeInUp" data-wow-duration="1.5s" data-wow-delay="0.3s">
                                <div className="col-lg-3 col-sm-6 pr-sm-4 pr-md-5 mb-2">
                                    <div className="footer-link">
                                        <p className="footer-title" style={{textDecoration:'underline'}}>Portalnesia</p>
                                        <p className="text text-justify" style={{marginTop: 18,fontSize: 16,color: '#121212',fontWeight: 500}}>Portalnya Indonesia</p>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-sm-6 mb-2">
                                    <div className="footer-link">
                                        <p className="footer-title" style={{textDecoration:'underline'}}>Features</p>
                                        <ul>
                                            <li><Link href='/news' passHref><a>News</a></Link></li>
                                            <li><Link href='/chord' passHref><a>Chord</a></Link></li>
                                            <li><Link href='/twibbon' passHref><a>Twibbon</a></Link></li>
                                            <li><Link href='/blog' passHref><a>Blog</a></Link></li>
                                            <li><Link href='/quiz' passHref><a>Quiz</a></Link></li>
                                            <li><Link href='/url' passHref><a>URL Shortener</a></Link></li>
                                            <li><Link href='/geodata/transform' passHref><a>Transform Coordinate</a></Link></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-sm-6 mb-2">
                                    <div className="footer-link">
                                        <p className="footer-title" style={{textDecoration:'underline'}}>Tools</p>
                                        <ul>
                                            <li><Link href='/qr-code' passHref><a>QR Code Generator</a></Link></li>
                                            <li><Link href='/parse-html' passHref><a>Parse HTML</a></Link></li>
                                            <li><Link href='/random-number' passHref><a>Random Number Generator</a></Link></li>
                                            <li><Link href='/twitter/thread' passHref><a>Twitter Thread Reader</a></Link></li>
                                            <li><Link href='/downloader' passHref><a>Downloader</a></Link></li>
                                            <li><Link href='/images-checker' passHref><a>Images Checker</a></Link></li>
                                            <li><Link href='/twitter/docs' passHref><a>Twitter Menfess</a></Link></li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-sm-6 mb-2 mb-sm-0">
                                    <div className="footer-link">
                                        <p className="footer-title" style={{textDecoration:'underline'}}>Help</p>
                                        <ul>
                                            <li><Link href="/pages/[slug]" as='/pages/privacy-policy' passHref><a>{`Privacy Policy`}</a></Link></li>
                                            <li><Link href="/pages/[slug]" as='/pages/cookie-policy' passHref><a>{`Cookie Policy`}</a></Link></li>
                                            <li><Link href="/pages/[slug]" as='/pages/terms-of-service' passHref><a>{`Terms & Conditions`}</a></Link></li>
                                            <li><Link href="/contact" passHref><a>{`Contact`}</a></Link></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="footer-copyright">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-5">
                                    <div className="copyright text-center text-lg-left mt-10">
                                        <p className="text">Portalnesia © {dayjs().format("YYYY")}</p>
                                    </div>
                                </div>
                                <div className="col-lg-2">
                                    <div className="footer-logo text-center mt-10">
                                        <a href="/"><img className='no-drag' onContextMenu={(e)=>e.preventDefault()} src={`${process.env.CONTENT_URL}/icon/android-icon-36x36.png`} alt="Portalnesia" /></a>
                                    </div>
                                </div>
                                <div className="col-lg-5">
                                    <ul className="social text-center text-lg-right mt-10">
                                        <li><a target="_blank" href="/fb"><i className="lni lni-facebook-filled"></i></a></li>
                                        <li><a target="_blank" href="/tw"><i className="lni lni-twitter-original"></i></a></li>
                                        <li><a target="_blank" href="/ig"><i className="lni lni-instagram-original"></i></a></li>
                                        <li><a target="_blank" href="/ln"><i className='lni lni-line'></i></a></li>
                                        <li><a target="_blank" href="/tg"><i className='lni lni-telegram-original'></i></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
                <a href="#" className="back-to-top" onClick={handleBackToTop}><i className="lni lni-chevron-up"></i></a>
            </div>
        </div>
    )
}
const stateToProps=state=>({
    config:{
      captcha_sitekey:(state?.config?.captcha_sitekey||null),
    },
})
export default connect(stateToProps)(Landing);