import React, { Component } from'react'
import IPFS from 'ipfs'
import OrbitDB from 'orbit-db'
import { 
    MDBContainer, MDBRow, MDBCol, MDBBtn,
    MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter,
    MDBInput
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
        user_info: {
            data: {
                education: null
            }
        },
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
            
            const user_info = await db.get(public_hex)
            console.log('constructor user_info: ', user_info[0])
            if (user_info[0]) 
                this.setState({ user_info: user_info[0] })
        })
    }

    handleOnChange = (e) => {
        e.preventDefault()

        this.setState({ [e.target.id]: e.target.value })
    }

    handleSubmit = async (e) => {
        e.preventDefault()

        this.setState({ loading: true })
        const { db, education, public_hex } = this.state

        const data = { education }
        await db.put({ _id: public_hex, data })
        await this.reloadUserInfo()
    }

    reloadUserInfo = async () => {
        const { db, public_hex } = this.state 
        console.log('reloading user info')

        const user_info = await db.get(public_hex)
        console.log('user_info: ', user_info[0])
        this.setState({ user_info: user_info[0], loading: false })
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
        console.log('education_data: ', education_data)
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
        console.log('experience_data: ', experience_data)
    }
    
    render() {
        const { public_hex, user_info, loading } = this.state
        // console.log('user_info: ', user_info)
        let user_info_json = JSON.stringify(user_info)

        return (
          <MDBContainer>
            <h2>Decentralized CVs</h2>
            <p>Your public hex code: {public_hex}</p>
            {/* <input type='text' id='education' onChange={this.handleOnChange} />
            <button onClick={this.handleSubmit}>Submit</button> */}

            {/* <p>user_info: {user_info_json}</p>
            <p>user_info education: {loading ? '' : user_info.data.education}</p> */}
            <MDBRow>
                <MDBCol>
                    <MDBRow>
                        <MDBCol><h1 class="h4 mb-4">Education</h1></MDBCol>
                        <MDBCol><MDBBtn color="primary" onClick={() => this.setState({ education_modal: !this.state.education_modal })}>+</MDBBtn></MDBCol>
                    </MDBRow>
                    <MDBRow>
                        <MDBCol><h1 class="h4 mb-4">Experience</h1></MDBCol>
                        <MDBCol><MDBBtn color="primary" onClick={() => this.setState({ experience_modal: !this.state.experience_modal })}>+</MDBBtn></MDBCol>
                    </MDBRow>
                </MDBCol>
                <br />
                <br />
                <MDBCol>
                    PDF PREVIEW
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
