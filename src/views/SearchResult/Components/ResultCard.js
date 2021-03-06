import React, { useState, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import { CardHeader } from "@material-ui/core";
import CardActions from "@material-ui/core/CardActions";
import Collapse from "@material-ui/core/Collapse";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import { ThumbUp, ThumbUpOutlined, ThumbDown, ThumbDownAltOutlined } from "@material-ui/icons";
import ShareIcon from "@material-ui/icons/Share";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { createQRCodeURI, toggleLike, getCityInfo, toggleDislike } from "../../../API/Requests";
import { getCityId } from "../../../Helpers";
import "../styles.css";
import LoadingIndicator from "../../../Components/LoadingIndicator/LoadingIndicator";

// import { Container } from './styles';

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 345
    },
    media: {
        height: 0,
        paddingTop: '56.25%' // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest
        })
    },
    expandOpen: {
        transform: 'rotate(180deg)'
    },
    avatar: {
        backgroundColor: red[500]
    }
}));

function EmptyFeedback() {
    return <div>Não foi possível recuperar informações sobre esse lugar</div>;
}

function ResultCard(props) {
    const { id } = props;
    const [city, setCity] = useState({});
    const [country, setCountry] = useState({});
    const [expanded, setExpanded] = useState(true);
    const [loading, setLoading] = useState(true);
    const [likedByMe, setLikedByMe] = useState(false);
    const [likes, setLikes] = useState(0);
    const [dislikedByMe, setDislikedByMe] = useState(false);
    const [dislikes, setDislikes] = useState(0);
    const [error, setError] = useState(false);

    const qrCodeURI = createQRCodeURI(window.location.href);

    const splittedCityName = city?.name?.split(/\s/);
    const acronym = splittedCityName?.reduce(
        (response, word) => (response += word.slice(0, 1)),
        ''
    );

    const classes = useStyles();

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    async function handleLike() {
        toggleLike(id).then((placeIsLiked) => {
            setLikedByMe(placeIsLiked);
            if (placeIsLiked) {
                setLikes((prev) => prev + 1);
            } else {
                setLikes((prev) => prev - 1);
            }
        });
    }

    async function handleDislike() {
        toggleDislike(id).then((placeIsDisliked) => {
            setDislikedByMe(placeIsDisliked);
            if (placeIsDisliked) {
                setDislikes((prev) => prev + 1);
            } else {
                setDislikes((prev) => prev - 1);
            }
        });
    }

    const curTime = new Date().toLocaleString();

    useLayoutEffect(() => {
        setLoading(true);
        (async () => {
            await getCityInfo(id)
                .then((city) => {
                    console.log(JSON.stringify(city));
                    setCountry(city.country);
                    setCity(city);
                    setLikes(city.likes);
                    setLikedByMe(city.likedByMe);
                    setDislikes(city.dislikes);
                    setDislikedByMe(city.dislikedByMe);
                })
                .catch(() => {
                    setError(true);
                });
        })().then(() => {
            setLoading(false);
        });
    }, [id]);

  return (
    <>
      {error ? (
        <EmptyFeedback />
      ) : loading ? (
        <LoadingIndicator width={30} />
      ) : (
        <div
          className="search-result-outer"
          style={{
            background: `url(https://source.unsplash.com/3200x1800/?landscape,${splittedCityName.join(
              "+"
            )})`,
            backgroundSize: "cover",
          }}
        >
          <div className="search-result-card">
            <Card className="result-card-outer">
              <CardHeader
                avatar={
                  <Avatar aria-label="recipe" className={classes.avatar}>
                    {acronym}
                  </Avatar>
                }
                
                title={city.name}
                subheader={curTime}
              />

                            <CardMedia className='city-map'>
                                <iframe
                                    src={`https://maps.google.com/maps?q=${city.lat}, ${city.lng}&z=12&output=embed`}
                                    width='100%'
                                    height='300px'
                                    frameBorder='0'></iframe>
                            </CardMedia>

                            <CardContent style={{ padding:'4px'}}>
                                <div className='likes'>
                                    <IconButton
                                        className='favorite'
                                        aria-label='add to favorites'
                                        onClick={handleLike}
                                        color='secondary'>
                                        {likedByMe ? (
                                            <ThumbUp />
                                        ) : (
                                            <ThumbUpOutlined />
                                        )}
                                    </IconButton>
                                    {likes === 0
                                        ? 'Ninguém curtiu essa cidade ainda'
                                        : likes === 1 && !likedByMe
                                        ? 'Uma pessoa curtiu essa cidade'
                                        : likes === 1 && likedByMe
                                        ? 'Apenas você curtiu essa cidade'
                                        : `${likes} pessoas curtiram essa cidade`}
                                </div>
                            </CardContent>

                            <CardContent style={{ padding:'4px'}}>
                                <div className='dislikes'>
                                    <IconButton
                                        className='favorite'
                                        aria-label='add to favorites'
                                        onClick={handleDislike}
                                        color='secondary'>
                                        {dislikedByMe == true ? (
                                            <ThumbDown />
                                        ) : (
                                            <ThumbDownAltOutlined />
                                        )}
                                    </IconButton>
                                    <span>
                                    {dislikes === 0
                                        ? 'Ninguém descurtiu essa cidade ainda'
                                        : dislikes === 1 && !dislikedByMe
                                        ? 'Uma pessoa não curtiu essa cidade'
                                        : dislikes === 1 && dislikedByMe
                                        ? 'Apenas você não curtiu essa cidade'
                                        : `${dislikes} pessoas não curtiram essa cidade`}
                                    </span>
                                </div>
                            </CardContent>

                            <CardActions disableSpacing>
                                <Typography
                                    variant='body2'
                                    color='textSecondary'
                                    component='p'>
                                    Clique para ver mais detalhes desse lugar =)
                                </Typography>

                                <IconButton
                                    className={clsx(classes.expand, {
                                        [classes.expandOpen]: expanded
                                    })}
                                    onClick={handleExpandClick}
                                    aria-expanded={expanded}
                                    aria-label='show more'>
                                    <ExpandMoreIcon />
                                </IconButton>
                            </CardActions>

                            <Collapse
                                in={expanded}
                                timeout='auto'
                                unmountOnExit>
                                <CardContent>
                                    <Typography
                                        paragraph
                                        className='country-continent'>
                                        <span className='label'>
                                            Continente:{' '}
                                        </span>
                                        Continent: {country.continent.name}
                                    </Typography>

                                    <Typography
                                        paragraph
                                        className='country-name'>
                                        <span className='label'>País: </span>
                                        Country: {country.name} (
                                        {country.native})
                                    </Typography>

                                    <Typography
                                        paragraph
                                        className='country-capital'>
                                        <span className='label'>Capital: </span>
                                        <Link to={getCityId(country.capital)}>
                                            {country.capital}
                                        </Link>
                                    </Typography>

                                    <Typography
                                        paragraph
                                        className='country-phone'>
                                        <span className='label'>
                                            Telefone (DDI):{' '}
                                        </span>
                                        +{country.phone}
                                    </Typography>

                                    {!!country?.currency?.length && (
                                        <div className='country-currency'>
                                            <span className='label'>
                                                Moeda(s) utilizada(s) nesse
                                                país:
                                            </span>
                                            <ul className='currency-list'>
                                                {country.currency.map(
                                                    (cur, index) => (
                                                        <li
                                                            key={index}
                                                            className='currency-item'>
                                                            {`1 USD equivale a ${cur.price} ${cur.unit}`}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}

                                    <Typography>
                                        <div className='country-languages'>
                                            <span className='label'>
                                                Linguagem(ns) utilizada(s) nesse
                                                país:
                                            </span>
                                            <ul className='language-list'>
                                                {country.languages.map(
                                                    (item, index) => (
                                                        <li
                                                            key={index}
                                                            className='language-item'>
                                                            {item.name}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    </Typography>

                                    <div className='print-share'>
                                        <img
                                            src={qrCodeURI}
                                            className='share-qrcode'
                                            width='150'
                                            height='150'
                                        />
                                        <IconButton
                                            aria-label='share'
                                            onClick={() => window.print()}>
                                            <ShareIcon />
                                        </IconButton>
                                        Compartilhe com seus amigos e amigas!
                                    </div>
                                </CardContent>
                            </Collapse>
                        </Card>{' '}
                    </div>
                </div>
            )}
        </>
    );
}

export default ResultCard;

