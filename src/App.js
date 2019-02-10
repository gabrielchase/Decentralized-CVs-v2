import React, { Component } from'react'
import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'
import { 
    MDBContainer, MDBRow, MDBCol, MDBBtn,
    MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter,
    MDBInput,
    MDBCard, MDBCardBody
} from 'mdbreact'

import '@fortawesome/fontawesome-free/css/all.min.css'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbreact/dist/css/mdb.css'

class App extends Component {
    state = {
        ipfs: null,
        orbitdb: null,
        db: null, 
        public_hex: null,
        education: '',
        user_info_name: '',
        user_info_address: '',
        user_info_email: '',
        user_info_phone_number: '',
        user_info_education: [],
        user_info_experience: [],
        loading: false,
        education_modal: false,
        experience_modal: false,
    }

    constructor(props) {
        super(props)
        console.log('hi')
    
        const ipfs = new IPFS({
            EXPERIMENTAL: {
                pubsub: true
            }
        })
    
        ipfs.on('ready', async () => {
            console.log('ipfs ready')
    
            //Create OrbitDB instance
            const orbitdb = new OrbitDB(ipfs)
            console.log('orbitdb ready')
    
            const public_hex = orbitdb.key.getPublic('hex')
            console.log('public_hex: ', public_hex)
            const access = {
                // Give write access to ourselves
                write: [public_hex],
            }
        
            const db = await orbitdb.docstore('decentralized-cvs', access)
            await db.load()
            console.log('db address', db.address.toString())
            
            //store ipfs and orbitdb in state
            this.setState({
                ipfs,
                orbitdb,
                db,
                public_hex
            })
            
            const res = await db.get(public_hex)
            const { _id, data } = res[0]
            console.log('constructor', res)
            if (_id) 
                this.setState({ 
                    user_info_name: data.user_info_name,
                    user_info_email: data.user_info_email,
                    user_info_education: data.user_info_education,
                    user_info_experience: data.user_info_experience
                })
                // console.log('new state: ', this.state)
        })
    }

    handleOnChange = (e) => {
        e.preventDefault()

        this.setState({ [e.target.id]: e.target.value })
    }

    handleAddEducation = async () => {
        const { school, degree, course, education_start_date, education_end_date } = this.state 

        const education_data = {
            school,
            degree,
            course,
            education_start_date,
            education_end_date
        }
        console.log(education_data)
        this.setState(prevState => ({
            user_info_education: [...prevState.user_info_education, education_data]
        }))
        this.setState({ education_modal: !this.state.education_modal })
        console.log(this.state.user_info_education)
    }

    handleAddExperience = async () => {
        const { company, position, experience_start_date, experience_end_date, job_description } = this.state 
        const experience_data = {
            company, 
            position, 
            experience_start_date, 
            experience_end_date, 
            job_description
        }
        this.setState(prevState => ({
            user_info_experience: [...prevState.user_info_experience, experience_data]
        }))
        this.setState({ experience_modal: !this.state.experience_modal })
        console.log(this.state.user_info_experience)
    }

    handleUpdateUserData = async () => {
        const { user_info_name, user_info_email, user_info_education, user_info_experience, db, public_hex } = this.state
        const data = { user_info_name, user_info_email, user_info_education, user_info_experience }
        console.log('ALL USER_INFO: ', data)
        await db.put({ _id: public_hex, data })
    }


    
    render() {
        const { public_hex } = this.state

        return (
          <MDBContainer>
            <h2>Decentralized CVs</h2>
            <p>Your public hex code: {public_hex}</p>
            <MDBBtn color="green" onClick={this.handleUpdateUserData}>Save Changes</MDBBtn>
            <MDBRow>
                <MDBCol>
                    <MDBInput
                        label="Your name"
                        icon="user"
                        group
                        type="text"
                        validate
                        error="wrong"
                        success="right"
                        id='user_info_name'
                        onChange={this.handleOnChange}
                        value={this.state.user_info_name}
                    />
                    {this.state.user_info_name}
                    <MDBInput
                        label="Your email"
                        icon="envelope"
                        group
                        type="email"
                        validate
                        error="wrong"
                        success="right"
                        id='user_info_email'
                        onChange={this.handleOnChange}
                        value={this.state.user_info_email}
                    />
                    {this.state.user_info_email}
                    <MDBRow>
                        <MDBCol><h1 class="h4 mb-4">Education</h1></MDBCol>
                        <MDBCol><MDBBtn color="primary" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>+</MDBBtn></MDBCol>
                        {this.state.user_info_education.map((e) => {
                            return (
                                <div>
                                    <p>{e.school}</p>
                                    <p>{e.degree} - {e.course}</p>
                                    <p>{e.education_start_date} - {e.education_end_date}</p>
                                </div>
                            )
                        })}
                    </MDBRow>
                    <MDBRow>
                        <MDBCol><h1 class="h4 mb-4">Experience</h1></MDBCol>
                        <MDBCol><MDBBtn color="primary" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>+</MDBBtn></MDBCol>
                        {this.state.user_info_experience.map((e) => {
                            return (
                                <div>
                                    <p>{e.company}</p>
                                    <p>{e.position}</p>
                                    <p>{e.experience_start_date} - {e.experience_end_date}</p>
                                    <p>{e.job_description}</p>
                                </div>
                            )
                        })}
                    </MDBRow>
                </MDBCol>
                <br />
                <br />
                <MDBCol>
                    <h1>PDF PREVIEW</h1>
                    <MDBContainer>
                        <MDBCard>
                            <MDBCardBody>
                                <h1>{this.state.user_info_name}</h1>
                                <h1>{this.state.user_info_email}</h1>
                                <h1>Education</h1>
                                {this.state.user_info_education.map((e) => {
                                    return (
                                        <div>
                                            <p>{e.school}</p>
                                            <p>{e.degree} - {e.course}</p>
                                            <p>{e.education_start_date} - {e.education_end_date}</p>
                                        </div>
                                    )
                                })}
                                <h1>Experience</h1>
                                {this.state.user_info_experience.map((e) => {
                                    return (
                                        <div>
                                            <p>{e.company}</p>
                                            <p>{e.position}</p>
                                            <p>{e.experience_start_date} - {e.experience_end_date}</p>
                                            <p>{e.job_description}</p>
                                        </div>
                                    )
                                })}
                            </MDBCardBody>
                        </MDBCard>
                    </MDBContainer>
                </MDBCol>
            </MDBRow>

            <MDBModal isOpen={this.state.education_modal} toggle={() => this.setState({ education_modal: !this.state.education_modal })} centered>
                <MDBModalHeader toggle={() => this.setState({ education_modal: !this.state.education_modal })}>Add Education</MDBModalHeader>
                <MDBModalBody>
                    <MDBContainer>
                        <form>
                            <div className="grey-text">
                                <MDBInput
                                    label="School"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='school'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Degree"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='degree'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Course"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='course'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Start Year-Month"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='education_start_date'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Graduation Year-Month"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='education_end_date'
                                    onChange={this.handleOnChange}
                                />
                            </div>
                        </form>
                    </MDBContainer>
                </MDBModalBody>
                <MDBModalFooter>
                    <MDBBtn color="secondary" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>Close</MDBBtn>
                    <MDBBtn color="primary" onClick={this.handleAddEducation}>Add</MDBBtn>
                </MDBModalFooter>
            </MDBModal>
            <MDBModal isOpen={this.state.experience_modal} toggle={() => this.setState({ experience_modal: !this.state.experience_modal })} centered>
                <MDBModalHeader toggle={() => this.setState({ experience_modal: !this.state.experience_modal })}>Add Experience</MDBModalHeader>
                <MDBModalBody>
                    <MDBContainer>
                        <form>
                            <div className="grey-text">
                                <MDBInput
                                    label="Company"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='company'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Position"
                                    group
                                    type="email"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='position'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="Start Month and Year"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='experience_start_date'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    label="End Month and Year"
                                    group
                                    type="text"
                                    validate
                                    error="wrong"
                                    success="right"
                                    id='experience_end_date'
                                    onChange={this.handleOnChange}
                                />
                                <MDBInput
                                    type="textarea"
                                    rows="3"
                                    label="Job Description"
                                    id='job_description'
                                    onChange={this.handleOnChange}
                                />
                            </div>
                        </form>
                    </MDBContainer>
                </MDBModalBody>
                <MDBModalFooter>
                    <MDBBtn color="secondary" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>Close</MDBBtn>
                    <MDBBtn color="primary" onClick={this.handleAddExperience}>Add</MDBBtn>
                </MDBModalFooter>
            </MDBModal>
          </MDBContainer>
        )
    }
}

export default App 
